import React, { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import "../styles/pages/CheckoutPage.css";
import "../styles/shared/LoadingState.css";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useProcessing } from "../contexts/ProcessingContext";
import { checkout } from "../services/orderService";
import {
  checkPincodeServiceability,
  createAddress,
  fetchAddresses,
  fetchCheckoutCoupons,
  fetchWallet,
} from "../services/accountService";
import {
  Order,
  PincodeServiceabilityResult,
  UserAddress,
  WalletCoupon,
  WalletSummary,
} from "../types/store";
import { formatCurrency } from "../utils/currency";
import { storeSelectedAddress } from "../utils/selectedAddress";

const DELIVERY_SLOTS = [
  "09:00-11:00",
  "11:00-13:00",
  "13:00-15:00",
  "15:00-18:00",
  "18:00-21:00",
];

interface CheckoutFormState {
  address: string;
  city: string;
  postalCode: string;
  deliverySlot: string;
  couponCode: string;
  useWalletBalance: boolean;
  priorityOrder: boolean;
  priorityNotes: string;
}

const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const { clearCart, items, subtotal } = useCart();
  const { startProcessing, stopProcessing } = useProcessing();
  const [formState, setFormState] = useState<CheckoutFormState>({
    address: "",
    city: "",
    postalCode: "",
    deliverySlot: DELIVERY_SLOTS[0],
    couponCode: "",
    useWalletBalance: false,
    priorityOrder: false,
    priorityNotes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | "new">("new");
  const [saveAddress, setSaveAddress] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [checkoutCoupons, setCheckoutCoupons] = useState<WalletCoupon[]>([]);
  const [isCouponPickerOpen, setIsCouponPickerOpen] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState<PincodeServiceabilityResult | null>(null);
  const [checkingPincode, setCheckingPincode] = useState(false);
  const deliveryMode = user?.preferredDeliveryMode ?? "HOME_DELIVERY";
  const isStorePickup = deliveryMode === "STORE_PICKUP";

  useEffect(() => {
    const loadAddresses = async () => {
      const processingId = startProcessing({
        title: "Loading checkout",
        message: "Bringing in your saved delivery addresses...",
      });
      try {
        const response = await fetchAddresses();
        setAddresses(response);
        const defaultAddress = response.find((address) => address.defaultAddress) ?? response[0];
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          setFormState((current) => ({
            ...current,
            address: defaultAddress.streetAddress,
            city: defaultAddress.city,
            postalCode: defaultAddress.postalCode,
          }));
          storeSelectedAddress(user, defaultAddress);
        } else {
          storeSelectedAddress(user, null);
        }
      } catch {
        setAddresses([]);
        setSelectedAddressId("new");
        storeSelectedAddress(user, null);
      } finally {
        setLoadingAddresses(false);
        stopProcessing(processingId);
      }
    };

    if (!isStorePickup) {
      void loadAddresses();
      return;
    }

    setLoadingAddresses(false);
  }, [isStorePickup, startProcessing, stopProcessing, user]);

  useEffect(() => {
    const loadWallet = async () => {
      try {
        setWallet(await fetchWallet());
      } catch {
        setWallet(null);
      }
    };

    void loadWallet();
  }, []);

  const selectedAddress = useMemo(
    () =>
      typeof selectedAddressId === "number"
        ? addresses.find((address) => address.id === selectedAddressId) ?? null
        : null,
    [addresses, selectedAddressId],
  );
  const selectedCoupon = useMemo(
    () =>
      checkoutCoupons.find(
        (coupon) => coupon.code.toUpperCase() === formState.couponCode.trim().toUpperCase(),
      ) ?? null,
    [checkoutCoupons, formState.couponCode],
  );
  const couponDiscountAmount = useMemo(() => {
    if (selectedCoupon?.type !== "ORDER_DISCOUNT") {
      return 0;
    }
    const discountPercentage = selectedCoupon.discountPercentage ?? 0;
    if (discountPercentage <= 0) {
      return 0;
    }
    return Math.min(Math.round(subtotal * discountPercentage) / 100, subtotal);
  }, [selectedCoupon, subtotal]);
  const discountedSubtotal = Math.max(subtotal - couponDiscountAmount, 0);
  const hasSavedAddress = Boolean(selectedAddress);
  const activePostalCode = (selectedAddress?.postalCode ?? formState.postalCode).trim();

  useEffect(() => {
    const loadCoupons = async () => {
      try {
        setCheckoutCoupons(await fetchCheckoutCoupons());
      } catch {
        setCheckoutCoupons([]);
      }
    };

    void loadCoupons();
  }, []);

  useEffect(() => {
    if (isStorePickup) {
      setPincodeStatus(null);
      setCheckingPincode(false);
      return;
    }

    if (!/^\d{6}$/.test(activePostalCode)) {
      setPincodeStatus(null);
      setCheckingPincode(false);
      return;
    }

    let cancelled = false;
    setCheckingPincode(true);
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await checkPincodeServiceability(activePostalCode);
        if (!cancelled) {
          setPincodeStatus(response);
        }
      } catch {
        if (!cancelled) {
          setPincodeStatus(null);
        }
      } finally {
        if (!cancelled) {
          setCheckingPincode(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [activePostalCode, isStorePickup]);

  const shipping = isStorePickup ? 0 : discountedSubtotal >= 4999 ? 0 : 499;
  const tax = Math.round(discountedSubtotal * 0.18 * 100) / 100;
  const total = discountedSubtotal + shipping + tax;
  const walletDebitPreview = formState.useWalletBalance && wallet?.balance
    ? Math.min(wallet.balance, total)
    : 0;
  const payableNow = Math.max(total - walletDebitPreview, 0);

  const extractCheckoutError = (error: unknown) => {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message;
      if (typeof message === "string" && message.trim()) {
        return message;
      }
      const fieldErrors = error.response?.data?.errors;
      if (fieldErrors && typeof fieldErrors === "object") {
        const firstMessage = Object.values(fieldErrors).find(
          (value) => typeof value === "string" && value.trim(),
        );
        if (typeof firstMessage === "string") {
          return firstMessage;
        }
      }
    }
    return "Couldn't place your order right now. Please try again.";
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, type, value } = event.target;
    if (type === "checkbox") {
      const checked = (event.target as HTMLInputElement).checked;
      setFormState((currentState) => ({
        ...currentState,
        [name as keyof CheckoutFormState]: checked,
      }));
      return;
    }

    setFormState((currentState) => ({
      ...currentState,
      [name as keyof CheckoutFormState]: value,
    }));
  };

  const handleAddressSelect = (value: string) => {
    if (value === "new") {
      setSelectedAddressId("new");
      storeSelectedAddress(user, null);
      return;
    }
    const nextAddress = addresses.find((address) => address.id === Number(value));
    if (!nextAddress) {
      return;
    }
    setSelectedAddressId(nextAddress.id);
    storeSelectedAddress(user, nextAddress);
    setFormState((current) => ({
      ...current,
      address: nextAddress.streetAddress,
      city: nextAddress.city,
      postalCode: nextAddress.postalCode,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingOrder) {
      return;
    }
    const requiredValues = isStorePickup
      ? [user?.fullName, user?.phoneNumber]
      : [
          user?.fullName,
          user?.phoneNumber,
          formState.deliverySlot,
          selectedAddress ? selectedAddress.streetAddress : formState.address,
          selectedAddress ? selectedAddress.city : formState.city,
          selectedAddress ? selectedAddress.postalCode : formState.postalCode,
        ];
    const isValid = requiredValues.every((value) => String(value).trim());
    if (!isValid) {
      toast.error(
        isStorePickup
          ? "Please complete your profile name and mobile number before checkout."
          : "Please complete address, city, postal code, profile name, and mobile number.",
      );
      return;
    }

    if (!isStorePickup) {
      const serviceability = await checkPincodeServiceability(activePostalCode).catch(() => null);
      if (!serviceability?.serviceable) {
        toast.error(
          serviceability?.message || "Home delivery is not available for this pincode yet.",
        );
        return;
      }
      setPincodeStatus(serviceability);
    }

    let nextAddressId = typeof selectedAddressId === "number" ? selectedAddressId : null;
    setSubmittingOrder(true);
    const processingId = startProcessing({
      title: "Placing your order",
      message: "Finalizing delivery, payment details, and order confirmation...",
    });
    try {
      if (!isStorePickup && selectedAddressId === "new" && saveAddress) {
        const savedAddress = await createAddress({
          label: `Address ${addresses.length + 1}`,
          recipientName: user?.fullName || "Customer",
          phone: user?.phoneNumber || "",
          streetAddress: formState.address,
          city: formState.city,
          postalCode: formState.postalCode,
          defaultAddress: addresses.length === 0,
        });
        nextAddressId = savedAddress.id;
        setAddresses((current) => [...current, savedAddress]);
        storeSelectedAddress(user, savedAddress);
      }

      const order = await checkout({
        deliveryMode,
        shippingName: user?.fullName || "",
        email: user?.email || "",
        phone: user?.phoneNumber || "",
        addressId: nextAddressId,
        shippingAddress: selectedAddress?.streetAddress ?? formState.address,
        city: selectedAddress?.city ?? formState.city,
        postalCode: selectedAddress?.postalCode ?? formState.postalCode,
        deliverySlot: isStorePickup ? "STORE_PICKUP_WINDOW" : formState.deliverySlot,
        couponCode: formState.couponCode,
        useWalletBalance: formState.useWalletBalance,
        priorityOrder: formState.priorityOrder,
        priorityNotes: formState.priorityNotes,
      });
      setPlacedOrder(order);
      clearCart();
      setSubmitted(true);
      toast.success("Order placed successfully");
    } catch (error) {
      toast.error(extractCheckoutError(error));
    } finally {
      setSubmittingOrder(false);
      stopProcessing(processingId);
    }
  };

  return (
    <section className="shell section page-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Checkout</span>
          <h1>Shipping and payment</h1>
        </div>
      </div>

      {submitted ? (
        <div className="store-card empty-state">
          <h2>Order placed successfully</h2>
          <p>
            Thanks {placedOrder?.shippingName}. Your order ID is #{placedOrder?.id} and
            WhatsApp updates will be sent to {placedOrder?.phone}.
          </p>
          <p>
            Slot: {placedOrder?.deliverySlot || "Store pickup window"} | Fulfilment:{" "}
            {placedOrder?.deliveryMode === "STORE_PICKUP" ? "Pick up at store" : "Home delivery"}
          </p>
          {placedOrder?.appliedDiscountAmount ? (
            <p>
              Coupon {placedOrder.appliedCouponCode} saved you {formatCurrency(placedOrder.appliedDiscountAmount)} instantly at checkout.
            </p>
          ) : placedOrder?.walletCreditAmount ? (
            <p>
              Coupon {placedOrder.appliedCouponCode} will credit {formatCurrency(placedOrder.walletCreditAmount)} to wallet within one hour.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="checkout-layout">
          <form className="store-card form-card" onSubmit={handleSubmit}>
            <h2>{isStorePickup ? "Pickup details" : "Shipping details"}</h2>
            <div className="checkout-delivery-mode">
              <span>Selected fulfilment</span>
              <strong>{isStorePickup ? "Pick up at store" : "Home delivery"}</strong>
            </div>
            <div className="checkout-delivery-mode">
              <span>Order contact</span>
              <strong>{user?.fullName || "Profile name missing"} | {user?.phoneNumber || "Mobile missing"}</strong>
            </div>
            <div className="form-grid">
              {!isStorePickup ? (
                <>
                  {loadingAddresses ? (
                    <div className="checkout-pickup-note form-grid__wide">
                      Loading your saved addresses...
                    </div>
                  ) : null}
                  <label className="form-grid__wide">
                    Address book
                    <select
                      value={selectedAddressId}
                      onChange={(event) => handleAddressSelect(event.target.value)}
                      disabled={loadingAddresses || submittingOrder}
                    >
                      {addresses.map((address) => (
                        <option key={address.id} value={address.id}>
                          {address.label} - {address.streetAddress}, {address.city}
                        </option>
                      ))}
                      <option value="new">Use a new address</option>
                    </select>
                  </label>
                  {hasSavedAddress && selectedAddressId !== "new" ? (
                    <div className="checkout-saved-address form-grid__wide">
                      <div>
                        <span>Selected address</span>
                        <strong>{selectedAddress?.streetAddress}</strong>
                        <p>
                          {selectedAddress?.city}, {selectedAddress?.postalCode}
                        </p>
                        {checkingPincode ? (
                          <small className="checkout-pincode-status">
                            Checking pincode serviceability...
                          </small>
                        ) : pincodeStatus ? (
                          <small
                            className={`checkout-pincode-status ${
                              pincodeStatus.serviceable ? "is-serviceable" : "is-unserviceable"
                            }`}
                          >
                            {pincodeStatus.message}
                          </small>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => setSelectedAddressId("new")}
                      >
                        Add address
                      </button>
                    </div>
                  ) : (
                    <>
                      <label>
                        Delivery slot
                        <select
                          name="deliverySlot"
                          value={formState.deliverySlot}
                          onChange={handleChange}
                          disabled={submittingOrder}
                        >
                          {DELIVERY_SLOTS.map((slot) => (
                            <option key={slot} value={slot}>
                              {slot}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        City
                        <input
                          name="city"
                          value={selectedAddress?.city ?? formState.city}
                          onChange={handleChange}
                          disabled={Boolean(selectedAddress) || submittingOrder}
                        />
                      </label>
                      <label>
                        Postal code
                        <input
                          name="postalCode"
                          value={selectedAddress?.postalCode ?? formState.postalCode}
                          onChange={handleChange}
                          disabled={Boolean(selectedAddress) || submittingOrder}
                        />
                        {checkingPincode ? (
                          <small className="checkout-pincode-status">
                            Checking pincode serviceability...
                          </small>
                        ) : pincodeStatus ? (
                          <small
                            className={`checkout-pincode-status ${
                              pincodeStatus.serviceable ? "is-serviceable" : "is-unserviceable"
                            }`}
                          >
                            {pincodeStatus.message}
                          </small>
                        ) : (
                          <small className="checkout-pincode-status">
                            Home delivery is currently available for pincode 500074 only.
                          </small>
                        )}
                      </label>
                      <label className="form-grid__wide">
                        Address
                        <textarea
                          name="address"
                          rows={4}
                          value={selectedAddress?.streetAddress ?? formState.address}
                          onChange={handleChange}
                          disabled={Boolean(selectedAddress) || submittingOrder}
                        />
                      </label>
                      {selectedAddressId === "new" ? (
                        <label className="form-grid__wide checkout-inline-check">
                          <input
                            type="checkbox"
                            checked={saveAddress}
                            onChange={(event) => setSaveAddress(event.target.checked)}
                            disabled={submittingOrder}
                          />
                          <span>Save this address to my address book</span>
                        </label>
                      ) : null}
                    </>
                  )}
                </>
              ) : (
                <div className="checkout-pickup-note form-grid__wide">
                  Store pickup selected. We will contact you with collection timing after the
                  order is confirmed.
                </div>
              )}
              <label className="form-grid__wide checkout-inline-check">
                <input
                  type="checkbox"
                  name="priorityOrder"
                  checked={formState.priorityOrder}
                  onChange={handleChange}
                  disabled={submittingOrder}
                />
                <span>Mark this as a priority order</span>
              </label>
              {formState.priorityOrder ? (
                <label className="form-grid__wide">
                  Priority notes
                  <textarea
                    name="priorityNotes"
                    rows={3}
                    value={formState.priorityNotes}
                    onChange={handleChange}
                    disabled={submittingOrder}
                    placeholder="Share urgency, site needs, or delivery constraints."
                  />
                </label>
              ) : null}
              <div className="form-grid__wide checkout-coupon-picker">
                <button
                  type="button"
                  className="checkout-coupon-picker__trigger"
                  onClick={() => setIsCouponPickerOpen((open) => !open)}
                  disabled={submittingOrder || !checkoutCoupons.length}
                  aria-expanded={isCouponPickerOpen}
                >
                  <span className="checkout-coupon-picker__trigger-left">
                    <span className="checkout-coupon-picker__icon" aria-hidden="true">
                      ⚙
                    </span>
                    <span className="checkout-coupon-picker__copy">
                      <strong>Apply Coupon</strong>
                      {selectedCoupon ? (
                        <small>
                          {selectedCoupon.code} ·{" "}
                          {selectedCoupon.type === "ORDER_DISCOUNT"
                            ? `${selectedCoupon.discountPercentage ?? 0}% instant discount`
                            : `${formatCurrency(selectedCoupon.amount)} cashback`}
                        </small>
                      ) : checkoutCoupons.length ? (
                        <small>Select a coupon for instant savings or wallet cashback</small>
                      ) : (
                        <small>No coupons available right now</small>
                      )}
                    </span>
                  </span>
                  <span className="checkout-coupon-picker__action">
                    {selectedCoupon ? "Change" : "Select"}
                  </span>
                </button>

                {isCouponPickerOpen && checkoutCoupons.length ? (
                  <div className="checkout-coupon-picker__panel">
                    {checkoutCoupons.map((coupon) => {
                      const isActive =
                        formState.couponCode.trim().toUpperCase() === coupon.code.toUpperCase();

                      return (
                        <button
                          key={coupon.id}
                          type="button"
                          className={`checkout-coupon-picker__option ${
                            isActive ? "is-active" : ""
                          }`}
                          onClick={() => {
                            setFormState((current) => ({ ...current, couponCode: coupon.code }));
                            setIsCouponPickerOpen(false);
                          }}
                        >
                          <span>
                            <strong>{coupon.code}</strong>
                            <small>
                              {coupon.description?.trim()
                                || (coupon.type === "ORDER_DISCOUNT"
                                  ? "Instant discount applied before payment"
                                  : "Wallet cashback after order placement")}
                            </small>
                          </span>
                          <em>
                            {coupon.type === "ORDER_DISCOUNT"
                              ? `${coupon.discountPercentage ?? 0}% off`
                              : `${formatCurrency(coupon.amount)} cashback`}
                          </em>
                        </button>
                      );
                    })}
                    {selectedCoupon ? (
                      <button
                        type="button"
                        className="checkout-coupon-picker__clear"
                        onClick={() => {
                          setFormState((current) => ({ ...current, couponCode: "" }));
                          setIsCouponPickerOpen(false);
                        }}
                      >
                        Remove coupon
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <label className="form-grid__wide checkout-inline-check">
                <input
                  type="checkbox"
                  name="useWalletBalance"
                  checked={formState.useWalletBalance}
                  onChange={handleChange}
                  disabled={submittingOrder || !wallet?.balance}
                />
                <span>Use wallet balance {wallet?.balance ? `(${formatCurrency(wallet.balance)} available)` : ""}</span>
              </label>
            </div>
            <div className="payment-placeholder">
              <h3>Payment section</h3>
              <p>
                Reserve this block for Razorpay, Stripe, COD, or your preferred payment
                gateway integration.
              </p>
            </div>
            <button className="button" type="submit" disabled={submittingOrder}>
              {submittingOrder ? (
                <span className="button-loading">
                  <span className="button-loading__spinner" aria-hidden="true" />
                  Placing order...
                </span>
              ) : (
                "Confirm order"
              )}
            </button>
          </form>

          <aside className="store-card summary-card">
            <h2>Order summary</h2>
            {items.map((item) => (
              <div key={item.product.id}>
                <span>
                  {item.product.name} × {item.quantity}
                </span>
                <strong>{formatCurrency(item.product.price * item.quantity)}</strong>
              </div>
            ))}
            <div>
              <span>Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
            {couponDiscountAmount > 0 ? (
              <div>
                <span>Instant discount</span>
                <strong>-{formatCurrency(couponDiscountAmount)}</strong>
              </div>
            ) : null}
            <div>
              <span>Shipping</span>
              <strong>
                {isStorePickup
                  ? "Store pickup"
                  : shipping === 0
                    ? "Free"
                    : formatCurrency(shipping)}
              </strong>
            </div>
            <div>
              <span>Tax</span>
              <strong>{formatCurrency(tax)}</strong>
            </div>
            {formState.useWalletBalance && wallet?.balance ? (
              <div>
                <span>Wallet used</span>
                <strong>-{formatCurrency(walletDebitPreview)}</strong>
              </div>
            ) : null}
            <div className="summary-total">
              <span>Payable now</span>
              <strong>{formatCurrency(payableNow)}</strong>
            </div>
            <p className="admin-field-hint">
              Checkout coupons can either add wallet cashback after order placement or reduce the total instantly.
            </p>
          </aside>
        </div>
      )}
    </section>
  );
};

export default CheckoutPage;
