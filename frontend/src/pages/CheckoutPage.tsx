import React, { useEffect, useMemo, useState } from "react";
import "../styles/pages/CheckoutPage.css";
import "../styles/shared/LoadingState.css";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useProcessing } from "../contexts/ProcessingContext";
import { checkout } from "../services/orderService";
import { createAddress, fetchAddresses } from "../services/accountService";
import { Order, UserAddress } from "../types/store";
import { formatCurrency } from "../utils/currency";

const DELIVERY_SLOTS = [
  "09:00-11:00",
  "11:00-13:00",
  "13:00-15:00",
  "15:00-18:00",
  "18:00-21:00",
];

interface CheckoutFormState {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  deliverySlot: string;
  priorityOrder: boolean;
  priorityNotes: string;
}

const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const { clearCart, items, subtotal } = useCart();
  const { startProcessing, stopProcessing } = useProcessing();
  const [formState, setFormState] = useState<CheckoutFormState>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    deliverySlot: DELIVERY_SLOTS[0],
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
            fullName: defaultAddress.recipientName,
            phone: defaultAddress.phone,
            address: defaultAddress.streetAddress,
            city: defaultAddress.city,
            postalCode: defaultAddress.postalCode,
          }));
        }
      } catch {
        setAddresses([]);
        setSelectedAddressId("new");
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
  }, [isStorePickup, startProcessing, stopProcessing]);

  const selectedAddress = useMemo(
    () =>
      typeof selectedAddressId === "number"
        ? addresses.find((address) => address.id === selectedAddressId) ?? null
        : null,
    [addresses, selectedAddressId],
  );

  const shipping = isStorePickup ? 0 : subtotal > 4999 ? 0 : 499;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

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
      return;
    }
    const nextAddress = addresses.find((address) => address.id === Number(value));
    if (!nextAddress) {
      return;
    }
    setSelectedAddressId(nextAddress.id);
    setFormState((current) => ({
      ...current,
      fullName: nextAddress.recipientName,
      phone: nextAddress.phone,
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
      ? [formState.fullName, formState.email, formState.phone]
      : [formState.fullName, formState.email, formState.phone, formState.deliverySlot];
    const isValid = requiredValues.every((value) => String(value).trim());
    if (!isValid) {
      toast.error("Please complete the required checkout details.");
      return;
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
          recipientName: formState.fullName,
          phone: formState.phone,
          streetAddress: formState.address,
          city: formState.city,
          postalCode: formState.postalCode,
          defaultAddress: addresses.length === 0,
        });
        nextAddressId = savedAddress.id;
        setAddresses((current) => [...current, savedAddress]);
      }

      const order = await checkout({
        deliveryMode,
        shippingName: formState.fullName,
        email: formState.email,
        phone: formState.phone,
        addressId: nextAddressId,
        shippingAddress: selectedAddress?.streetAddress ?? formState.address,
        city: selectedAddress?.city ?? formState.city,
        postalCode: selectedAddress?.postalCode ?? formState.postalCode,
        deliverySlot: isStorePickup ? "STORE_PICKUP_WINDOW" : formState.deliverySlot,
        priorityOrder: formState.priorityOrder,
        priorityNotes: formState.priorityNotes,
      });
      setPlacedOrder(order);
      clearCart();
      setSubmitted(true);
      toast.success("Order placed successfully");
    } catch {
      toast.error("Couldn't place your order right now. Please try again.");
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
        </div>
      ) : (
        <div className="checkout-layout">
          <form className="store-card form-card" onSubmit={handleSubmit}>
            <h2>{isStorePickup ? "Pickup details" : "Shipping details"}</h2>
            <div className="checkout-delivery-mode">
              <span>Selected fulfilment</span>
              <strong>{isStorePickup ? "Pick up at store" : "Home delivery"}</strong>
            </div>
            <div className="form-grid">
              <label>
                Full name
                <input name="fullName" value={formState.fullName} onChange={handleChange} />
              </label>
              <label>
                Email
                <input name="email" type="email" value={formState.email} onChange={handleChange} />
              </label>
              <label>
                Phone
                <input name="phone" value={formState.phone} onChange={handleChange} />
              </label>
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
            <div className="summary-total">
              <span>Payable now</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
};

export default CheckoutPage;
