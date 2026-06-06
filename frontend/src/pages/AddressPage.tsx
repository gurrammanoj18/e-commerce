import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import {
  checkPincodeServiceability,
  createAddress,
  fetchAddresses,
  updateAddress,
} from "../services/accountService";
import "../styles/pages/AccountPageSpacing.css";
import "../styles/pages/AddressPage.css";
import { PincodeServiceabilityResult, UserAddress } from "../types/store";
import { storeSelectedAddress } from "../utils/selectedAddress";

interface AddressFormState {
  label: string;
  recipientName: string;
  phone: string;
  streetAddress: string;
  city: string;
  postalCode: string;
  defaultAddress: boolean;
}

type AddressLabelMode = "home" | "office" | "other";

const ADDRESS_LABEL_OPTIONS: Array<{ value: Exclude<AddressLabelMode, "other">; label: string }> = [
  { value: "home", label: "Home" },
  { value: "office", label: "Office" },
];

const resolveLabelMode = (label: string): AddressLabelMode => {
  const normalized = label.trim().toLowerCase();
  if (normalized === "home" || normalized === "office") {
    return normalized;
  }
  return "other";
};

const createEmptyAddress = (userName = "", phone = ""): AddressFormState => ({
  label: "",
  recipientName: userName,
  phone,
  streetAddress: "",
  city: "",
  postalCode: "",
  defaultAddress: false,
});

const mapAddressToForm = (address: UserAddress): AddressFormState => ({
  label: address.label,
  recipientName: address.recipientName,
  phone: address.phone,
  streetAddress: address.streetAddress,
  city: address.city,
  postalCode: address.postalCode,
  defaultAddress: address.defaultAddress,
});

const AddressPage: React.FC = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | "new" | null>(null);
  const [labelMode, setLabelMode] = useState<AddressLabelMode>("home");
  const [customLabel, setCustomLabel] = useState("");
  const [formState, setFormState] = useState<AddressFormState>(
    createEmptyAddress(user?.fullName || "", user?.phoneNumber || ""),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState<PincodeServiceabilityResult | null>(null);
  const [checkingPincode, setCheckingPincode] = useState(false);

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const response = await fetchAddresses();
        setAddresses(response);
        const firstAddress = response.find((address) => address.defaultAddress) ?? response[0] ?? null;
        if (firstAddress) {
          setSelectedAddressId(firstAddress.id);
          setFormState(mapAddressToForm(firstAddress));
          setLabelMode(resolveLabelMode(firstAddress.label));
          setCustomLabel(resolveLabelMode(firstAddress.label) === "other" ? firstAddress.label : "");
          storeSelectedAddress(user, firstAddress);
        } else {
          setSelectedAddressId("new");
          setFormState(createEmptyAddress(user?.fullName || "", user?.phoneNumber || ""));
          setLabelMode("home");
          setCustomLabel("");
          storeSelectedAddress(user, null);
          setEditing(true);
        }
      } catch {
        toast.error("Unable to load your saved addresses right now.");
      } finally {
        setLoading(false);
      }
    };

    void loadAddresses();
  }, [user]);

  const selectedAddress = useMemo(
    () =>
      typeof selectedAddressId === "number"
        ? addresses.find((address) => address.id === selectedAddressId) ?? null
        : null,
    [addresses, selectedAddressId],
  );
  const activePostalCode = formState.postalCode.trim();

  useEffect(() => {
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
  }, [activePostalCode]);

  const handleSelectAddress = (address: UserAddress) => {
    setSelectedAddressId(address.id);
    setFormState(mapAddressToForm(address));
    const nextLabelMode = resolveLabelMode(address.label);
    setLabelMode(nextLabelMode);
    setCustomLabel(nextLabelMode === "other" ? address.label : "");
    storeSelectedAddress(user, address);
    setEditing(false);
  };

  const handleCreateNew = () => {
    setSelectedAddressId("new");
    setFormState(createEmptyAddress(user?.fullName || "", user?.phoneNumber || ""));
    setLabelMode("home");
    setCustomLabel("");
    storeSelectedAddress(user, null);
    setEditing(true);
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = event.target;
    setFormState((current) => ({
      ...current,
      [name]: type === "checkbox" ? (event.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) {
      return;
    }

    setSaving(true);
    const nextLabel =
      labelMode === "other"
        ? customLabel.trim()
        : ADDRESS_LABEL_OPTIONS.find((option) => option.value === labelMode)?.label || "Home";
    if (!nextLabel) {
      toast.error("Please enter a label for this address.");
      setSaving(false);
      return;
    }

    const payload = {
      ...formState,
      label: nextLabel,
    };

    try {
      if (typeof selectedAddressId === "number") {
        const updated = await updateAddress(selectedAddressId, payload);
        setAddresses((current) =>
          current.map((address) => (address.id === updated.id ? updated : address)),
        );
        setSelectedAddressId(updated.id);
        setFormState(mapAddressToForm(updated));
        const nextUpdatedMode = resolveLabelMode(updated.label);
        setLabelMode(nextUpdatedMode);
        setCustomLabel(nextUpdatedMode === "other" ? updated.label : "");
        storeSelectedAddress(user, updated);
      } else {
        const created = await createAddress(payload);
        setAddresses((current) => [...current, created]);
        setSelectedAddressId(created.id);
        setFormState(mapAddressToForm(created));
        const nextCreatedMode = resolveLabelMode(created.label);
        setLabelMode(nextCreatedMode);
        setCustomLabel(nextCreatedMode === "other" ? created.label : "");
        storeSelectedAddress(user, created);
      }

      setEditing(false);
      toast.success("Address saved successfully.");
    } catch {
      toast.error("Unable to save this address right now.");
    } finally {
      setSaving(false);
    }
  };

  return (
      <section className="shell section page-section address-page">
      <div className="page-header">
        <span className="eyebrow">Address</span>
        <h1>Saved addresses</h1>
      </div>

      <div className="address-layout">
        <aside className="store-card address-list-card">
          <div className="address-list-card__top">
            <h2>Address book</h2>
            <button type="button" className="link-button" onClick={handleCreateNew}>
              Add address
            </button>
          </div>

          {loading ? (
            <p className="address-list-card__empty">Loading your saved addresses...</p>
          ) : addresses.length ? (
            <div className="address-list">
              {addresses.map((address) => (
                <button
                  key={address.id}
                  type="button"
                  className={`address-list__item ${
                    selectedAddressId === address.id ? "is-active" : ""
                  }`}
                  onClick={() => handleSelectAddress(address)}
                >
                  <strong>{address.label || "Saved address"}</strong>
                  <span>{address.streetAddress}</span>
                  <span>
                    {address.city}, {address.postalCode}
                  </span>
                  {address.defaultAddress ? (
                    <small>Default address</small>
                  ) : null}
                </button>
              ))}
            </div>
          ) : (
            <p className="address-list-card__empty">
              No saved addresses yet. Add your first address here.
            </p>
          )}
        </aside>

        <section className="store-card address-detail-card">
          {editing || !selectedAddress ? (
            <form className="form-card address-form-card" onSubmit={handleSave}>
              <h2>{selectedAddress ? "Edit address" : "Add address"}</h2>
              <div className="form-grid">
                <fieldset className="address-label-group form-grid__wide">
                  <legend>Label</legend>
                  <div className="address-label-options">
                    {ADDRESS_LABEL_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className={`address-label-option ${
                          labelMode === option.value ? "is-selected" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="labelMode"
                          value={option.value}
                          checked={labelMode === option.value}
                          onChange={() => {
                            setLabelMode(option.value);
                            setCustomLabel("");
                          }}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                    <label
                      className={`address-label-option address-label-option--other ${
                        labelMode === "other" ? "is-selected" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="labelMode"
                        value="other"
                        checked={labelMode === "other"}
                        onChange={() => setLabelMode("other")}
                      />
                      <span>Other</span>
                    </label>
                  </div>
                  {labelMode === "other" ? (
                    <input
                      className="address-label-input"
                      value={customLabel}
                      onChange={(event) => setCustomLabel(event.target.value)}
                      placeholder="Enter custom label"
                      required
                    />
                  ) : null}
                </fieldset>
                <label>
                  Recipient name
                  <input
                    name="recipientName"
                    value={formState.recipientName}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  Phone number
                  <input name="phone" value={formState.phone} onChange={handleChange} required />
                </label>
                <label>
                  City
                  <input name="city" value={formState.city} onChange={handleChange} required />
                </label>
                <label>
                  Postal code
                  <input
                    name="postalCode"
                    value={formState.postalCode}
                    onChange={handleChange}
                    required
                  />
                  {checkingPincode ? (
                    <small className="address-pincode-status">
                      Checking pincode serviceability...
                    </small>
                  ) : pincodeStatus ? (
                    <small
                      className={`address-pincode-status ${
                        pincodeStatus.serviceable ? "is-serviceable" : "is-unserviceable"
                      }`}
                    >
                      {pincodeStatus.message}
                    </small>
                  ) : (
                    <small className="address-pincode-status">
                      Home delivery is currently available for pincode 500074 only.
                    </small>
                  )}
                </label>
                <label className="form-grid__wide">
                  Street address
                  <textarea
                    name="streetAddress"
                    rows={4}
                    value={formState.streetAddress}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label className="checkout-inline-check">
                  <input
                    type="checkbox"
                    name="defaultAddress"
                    checked={formState.defaultAddress}
                    onChange={handleChange}
                  />
                  <span>Set as default address</span>
                </label>
              </div>

              <div className="address-form-card__actions">
                <button className="button" type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save address"}
                </button>
                {selectedAddress ? (
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => {
                      setFormState(mapAddressToForm(selectedAddress));
                      setEditing(false);
                    }}
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          ) : (
            <div className="address-detail-card__content">
              <div className="address-detail-card__top">
                <div>
                  <span className="eyebrow">Selected address</span>
                  <h2>{selectedAddress.label}</h2>
                </div>
                <button type="button" className="link-button" onClick={() => setEditing(true)}>
                  Edit
                </button>
              </div>

              <div className="address-detail-card__grid">
                <div>
                  <span>Recipient</span>
                  <strong>{selectedAddress.recipientName}</strong>
                </div>
                <div>
                  <span>Phone</span>
                  <strong>{selectedAddress.phone}</strong>
                </div>
                <div className="address-detail-card__wide">
                  <span>Street address</span>
                  <strong>{selectedAddress.streetAddress}</strong>
                </div>
                <div>
                  <span>City</span>
                  <strong>{selectedAddress.city}</strong>
                </div>
                <div>
                  <span>Postal code</span>
                  <strong>{selectedAddress.postalCode}</strong>
                  {pincodeStatus ? (
                    <small
                      className={`address-pincode-status ${
                        pincodeStatus.serviceable ? "is-serviceable" : "is-unserviceable"
                      }`}
                    >
                      {pincodeStatus.message}
                    </small>
                  ) : null}
                </div>
                <div>
                  <span>Status</span>
                  <strong>{selectedAddress.defaultAddress ? "Default" : "Saved"}</strong>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </section>
  );
};

export default AddressPage;
