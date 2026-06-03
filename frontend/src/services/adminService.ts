import api from "./api";
import {
  AdminProductPayload,
  Banner,
  BannerPayload,
  BulkInquiry,
  BrandLogo,
  BrandLogoPayload,
  CategoryPayload,
  AdminUser,
  CategorySummary,
  DashboardOverview,
  InventoryItem,
  Order,
  ProductApiShape,
  ServiceRequest,
  ServiceablePincode,
  ServiceablePincodePayload,
  WalletCoupon,
  WalletCouponGrantPayload,
  WalletCouponPayload,
  WalletCouponRedemption,
} from "../types/store";
import { resolveShowInNavbar, transformProduct } from "./productService";

const mapCategory = (category: any): CategorySummary => ({
  id: category.id,
  name: category.name,
  slug: category.slug,
  count: category.productCount ?? category.count ?? 0,
  description: category.description,
  icon: category.icon,
  image: category.image,
  showInNavbar: resolveShowInNavbar(category),
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

export const fetchAdminSeasonalPicks = async () => {
  const response = await api.get<Banner[]>("/admin/seasonal-picks");
  return response.data;
};

export const createAdminSeasonalPick = async (payload: BannerPayload) => {
  const response = await api.post<Banner>("/admin/seasonal-picks", payload);
  return response.data;
};

export const updateAdminSeasonalPick = async (id: number, payload: BannerPayload) => {
  const response = await api.put<Banner>(`/admin/seasonal-picks/${id}`, payload);
  return response.data;
};

export const deleteAdminSeasonalPick = async (id: number) => {
  await api.delete(`/admin/seasonal-picks/${id}`);
};

export const fetchAdminBrandLogos = async () => {
  const response = await api.get<BrandLogo[]>("/admin/brand-logos");
  return response.data;
};

export const createAdminBrandLogo = async (payload: BrandLogoPayload) => {
  const response = await api.post<BrandLogo>("/admin/brand-logos", payload);
  return response.data;
};

export const updateAdminBrandLogo = async (id: number, payload: BrandLogoPayload) => {
  const response = await api.put<BrandLogo>(`/admin/brand-logos/${id}`, payload);
  return response.data;
};

export const deleteAdminBrandLogo = async (id: number) => {
  await api.delete(`/admin/brand-logos/${id}`);
};

export const fetchAdminServiceRequests = async () => {
  const response = await api.get<ServiceRequest[]>("/admin/service-requests");
  return response.data;
};

export const fetchAdminWalletCoupons = async () => {
  const response = await api.get<WalletCoupon[]>("/admin/wallet-coupons");
  return response.data;
};

export const createAdminWalletCoupon = async (payload: WalletCouponPayload) => {
  const response = await api.post<WalletCoupon>("/admin/wallet-coupons", payload);
  return response.data;
};

export const updateAdminWalletCoupon = async (id: number, payload: WalletCouponPayload) => {
  const response = await api.put<WalletCoupon>(`/admin/wallet-coupons/${id}`, payload);
  return response.data;
};

export const deleteAdminWalletCoupon = async (id: number) => {
  await api.delete(`/admin/wallet-coupons/${id}`);
};

export const fetchAdminWalletCouponRedemptions = async (couponId: number) => {
  const response = await api.get<WalletCouponRedemption[]>(`/admin/wallet-coupons/${couponId}/redemptions`);
  return response.data;
};

export const grantAdminWalletCouponRedemptions = async (
  couponId: number,
  payload: WalletCouponGrantPayload,
) => {
  const response = await api.post<WalletCouponRedemption>(`/admin/wallet-coupons/${couponId}/grant`, payload);
  return response.data;
};

export const fetchAdminServiceablePincodes = async () => {
  const response = await api.get<ServiceablePincode[]>("/admin/serviceable-pincodes");
  return response.data;
};

export const createAdminServiceablePincode = async (payload: ServiceablePincodePayload) => {
  const response = await api.post<ServiceablePincode>("/admin/serviceable-pincodes", payload);
  return response.data;
};

export const updateAdminServiceablePincode = async (
  id: number,
  payload: ServiceablePincodePayload,
) => {
  const response = await api.put<ServiceablePincode>(`/admin/serviceable-pincodes/${id}`, payload);
  return response.data;
};

export const deleteAdminServiceablePincode = async (id: number) => {
  await api.delete(`/admin/serviceable-pincodes/${id}`);
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
