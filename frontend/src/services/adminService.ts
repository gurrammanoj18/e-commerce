import api from "./api";
import {
  AdminProductPayload,
  Banner,
  BannerPayload,
  BulkInquiry,
  CategoryPayload,
  AdminUser,
  CategorySummary,
  DashboardOverview,
  InventoryItem,
  Order,
  ProductApiShape,
} from "../types/store";
import { transformProduct } from "./productService";

const mapCategory = (category: any): CategorySummary => ({
  id: category.id,
  name: category.name,
  slug: category.slug,
  count: category.productCount ?? category.count ?? 0,
  description: category.description,
  icon: category.icon,
  image: category.image,
  parentId: category.parentId,
  isLeaf: category.leaf ?? category.isLeaf,
  subcategories: (category.subcategories || []).map(mapCategory),
});

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

export const fetchAdminCategories = async () => {
  const response = await api.get<any[]>("/admin/categories");
  return response.data.map(mapCategory);
};

export const createAdminCategory = async (payload: CategoryPayload) => {
  const response = await api.post<any>("/admin/categories", payload);
  return mapCategory(response.data);
};

export const updateAdminCategory = async (id: number, payload: CategoryPayload) => {
  const response = await api.put<any>(`/admin/categories/${id}`, payload);
  return mapCategory(response.data);
};

export const deleteAdminCategory = async (id: number) => {
  await api.delete(`/admin/categories/${id}`);
};

export const fetchAdminBanners = async () => {
  const response = await api.get<Banner[]>("/admin/banners");
  return response.data;
};

export const createAdminBanner = async (payload: BannerPayload) => {
  const response = await api.post<Banner>("/admin/banners", payload);
  return response.data;
};

export const updateAdminBanner = async (id: number, payload: BannerPayload) => {
  const response = await api.put<Banner>(`/admin/banners/${id}`, payload);
  return response.data;
};

export const deleteAdminBanner = async (id: number) => {
  await api.delete(`/admin/banners/${id}`);
};

export const fetchAdminBulkInquiries = async () => {
  const response = await api.get<BulkInquiry[]>("/admin/bulk-inquiries");
  return response.data;
};

export const updateAdminBulkInquiry = async (
  id: number,
  payload: {
    quoteStatus: string;
    adminNotes?: string;
    estimatedTotal?: number | null;
    priorityRequest: boolean;
  },
) => {
  const response = await api.patch<BulkInquiry>(`/admin/bulk-inquiries/${id}`, payload);
  return response.data;
};
