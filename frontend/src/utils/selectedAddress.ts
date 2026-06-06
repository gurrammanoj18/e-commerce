import { AuthUser, UserAddress } from "../types/store";

export const SELECTED_ADDRESS_UPDATED_EVENT = "voltmart:selected-address-updated";
const SELECTED_ADDRESS_STORAGE_PREFIX = "voltmart-selected-address";

type AddressPreview = Pick<UserAddress, "label" | "streetAddress" | "city" | "postalCode">;

const getAddressStorageKey = (user: Pick<AuthUser, "id" | "email" | "phoneNumber"> | null) =>
  `${SELECTED_ADDRESS_STORAGE_PREFIX}:${user?.id ?? user?.email ?? user?.phoneNumber ?? "guest"}`;

export const formatAddressDisplay = (address: AddressPreview) => {
  const primary = address.label?.trim() || address.streetAddress?.trim() || "Address";
  const secondary =
    address.streetAddress?.trim() ||
    [address.city?.trim(), address.postalCode?.trim()].filter(Boolean).join(", ");
  return secondary ? `${primary} · ${secondary}` : primary;
};

export const readSelectedAddressDisplay = (
  user: Pick<AuthUser, "id" | "email" | "phoneNumber"> | null,
) => {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(getAddressStorageKey(user));
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as AddressPreview;
    return formatAddressDisplay(parsed);
  } catch {
    return null;
  }
};

export const storeSelectedAddress = (
  user: Pick<AuthUser, "id" | "email" | "phoneNumber"> | null,
  address: AddressPreview | null,
) => {
  if (typeof window === "undefined") {
    return;
  }

  const storageKey = getAddressStorageKey(user);
  if (address) {
    window.localStorage.setItem(storageKey, JSON.stringify(address));
  } else {
    window.localStorage.removeItem(storageKey);
  }

  window.dispatchEvent(new Event(SELECTED_ADDRESS_UPDATED_EVENT));
};
