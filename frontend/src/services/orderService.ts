import api from "./api";
import { Order } from "../types/store";

export const checkout = async (payload: {
  shippingName: string;
  email: string;
  phone: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
}) => {
  const response = await api.post<Order>("/orders/checkout", payload);
  return response.data;
};

export const fetchOrders = async () => {
  const response = await api.get<Order[]>("/orders");
  return response.data;
};
