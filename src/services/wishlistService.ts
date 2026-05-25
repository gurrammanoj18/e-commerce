import api from "./api";
import { WishlistApiResponse } from "../types/store";

export const fetchWishlist = async () => {
  const response = await api.get<WishlistApiResponse>("/wishlist");
  return response.data;
};

export const addWishlistItem = async (productId: number) => {
  const response = await api.post<WishlistApiResponse>("/wishlist/items", {
    productId,
  });
  return response.data;
};

export const removeWishlistItem = async (itemId: number) => {
  const response = await api.delete<WishlistApiResponse>(`/wishlist/items/${itemId}`);
  return response.data;
};
