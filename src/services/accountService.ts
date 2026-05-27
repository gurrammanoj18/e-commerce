import api from "./api";
import { UserAddress } from "../types/store";

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
