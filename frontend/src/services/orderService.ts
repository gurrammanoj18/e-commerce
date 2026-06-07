import api from "./api";
import { CartApiResponse, DeliveryMode, Order } from "../types/store";

export const checkout = async (payload: {
  deliveryMode: DeliveryMode;
  shippingName: string;
  email: string;
  phone: string;
  addressId?: number | null;
  shippingAddress: string;
  city: string;
  postalCode: string;
  deliverySlot?: string;
  couponCode?: string;
  useWalletBalance?: boolean;
  priorityOrder: boolean;
  priorityNotes?: string;
}) => {
  const response = await api.post<Order>("/orders/checkout", payload);
  return response.data;
};

export const fetchOrders = async () => {
  const response = await api.get<Order[]>("/orders");
  return response.data;
};

export const reorderOrder = async (orderId: number) => {
  const response = await api.post<CartApiResponse>(`/orders/${orderId}/reorder`);
  return response.data;
};
