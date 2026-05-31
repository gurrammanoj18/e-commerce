import api from "./api";
import {
  PincodeServiceabilityResult,
  UserAddress,
  WalletCoupon,
  WalletSummary,
} from "../types/store";

export const fetchAddresses = async () => {
  const response = await api.get<UserAddress[]>("/account/addresses");
  return response.data;
};

export const createAddress = async (payload: Omit<UserAddress, "id">) => {
  const response = await api.post<UserAddress>("/account/addresses", payload);
  return response.data;
};

export const updateAddress = async (id: number, payload: Omit<UserAddress, "id">) => {
  const response = await api.put<UserAddress>(`/account/addresses/${id}`, payload);
  return response.data;
};

export const deleteAddress = async (id: number) => {
  await api.delete(`/account/addresses/${id}`);
};

export const fetchWallet = async () => {
  const response = await api.get<WalletSummary>("/account/wallet");
  return response.data;
};

export const redeemWalletCode = async (code: string) => {
  const response = await api.post<WalletSummary>("/account/wallet/redeem", { code });
  return response.data;
};

export const fetchCheckoutCoupons = async () => {
  const response = await api.get<WalletCoupon[]>("/account/wallet/checkout-coupons");
  return response.data;
};

export const checkPincodeServiceability = async (pincode: string) => {
  const response = await api.get<PincodeServiceabilityResult>("/pincode-serviceability", {
    params: { pincode },
  });
  return response.data;
};
