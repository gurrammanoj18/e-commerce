import api from "./api";
import {
  AdminProductPayload,
  AdminUser,
  DashboardOverview,
  InventoryItem,
  Order,
  ProductApiShape,
} from "../types/store";
import { transformProduct } from "./productService";

export const fetchDashboardOverview = async () => {
  const response = await api.get<DashboardOverview>("/admin/dashboard");
  return response.data;
};

export const fetchAdminOrders = async () => {
  const response = await api.get<Order[]>("/admin/orders");
  return response.data;
};

export const fetchAdminUsers = async () => {
  const response = await api.get<AdminUser[]>("/admin/users");
  return response.data;
};

export const fetchAdminInventory = async () => {
  const response = await api.get<InventoryItem[]>("/admin/inventory");
  return response.data;
};

export const fetchAdminProducts = async () => {
  const response = await api.get<ProductApiShape[]>("/admin/products");
  return response.data.map(transformProduct);
};

export const createAdminProduct = async (payload: AdminProductPayload) => {
  const response = await api.post<ProductApiShape>("/admin/products", payload);
  return transformProduct(response.data);
};

export const updateAdminProduct = async (
  productId: number,
  payload: AdminProductPayload,
) => {
  const response = await api.put<ProductApiShape>(`/admin/products/${productId}`, payload);
  return transformProduct(response.data);
};

export const deleteAdminProduct = async (productId: number) => {
  await api.delete(`/admin/products/${productId}`);
};

export const updateAdminOrderStatus = async (orderId: number, status: string) => {
  const response = await api.patch<Order>(`/admin/orders/${orderId}`, null, {
    params: { status },
  });
  return response.data;
};

export const deleteAdminOrder = async (orderId: number) => {
  await api.delete(`/admin/orders/${orderId}`);
};
