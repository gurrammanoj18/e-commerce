import api from "./api";
import { CartApiResponse } from "../types/store";

export const fetchCart = async () => {
  const response = await api.get<CartApiResponse>("/cart");
  return response.data;
};

export const addCartItem = async (productId: number, quantity: number) => {
  const response = await api.post<CartApiResponse>("/cart/items", {
    productId,
    quantity,
  });
  return response.data;
};

export const updateCartItem = async (
  itemId: number,
  productId: number,
  quantity: number
) => {
  const response = await api.put<CartApiResponse>(`/cart/items/${itemId}`, {
    productId,
    quantity,
  });
  return response.data;
};

export const removeCartItem = async (itemId: number) => {
  const response = await api.delete<CartApiResponse>(`/cart/items/${itemId}`);
  return response.data;
};
