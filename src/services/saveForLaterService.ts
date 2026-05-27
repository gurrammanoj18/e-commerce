import api from "./api";
import { SaveForLaterResponse } from "../types/store";
import { transformProduct } from "./productService";

const mapResponse = (response: any): SaveForLaterResponse => ({
  itemCount: response.itemCount,
  items: response.items.map((item: any) => ({
    ...item,
    product: transformProduct(item.product),
  })),
});

export const fetchSavedForLater = async () => {
  const response = await api.get<any>("/save-for-later");
  return mapResponse(response.data);
};

export const addSavedForLaterItem = async (productId: number, quantity: number) => {
  const response = await api.post<any>("/save-for-later", {
    productId,
    quantity,
  });
  return mapResponse(response.data);
};

export const removeSavedForLaterItem = async (itemId: number) => {
  const response = await api.delete<any>(`/save-for-later/${itemId}`);
  return mapResponse(response.data);
};
