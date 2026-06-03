export interface ProductApiShape {
  id: number;
  slug: string;
  name: string;
  brand: string;
  category: string;
  categorySlug: string;
  subcategory: string;
  subcategorySlug: string;
  subcategoryId: number;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  stockQuantity?: number;
  stock?: number;
  lowStock?: boolean;
  badge: string;
  shortDescription: string;
  description: string;
  heroTag: string;
  images: string[];
  tags: string[];
  featured: boolean;
  bestSeller: boolean;
  bulkEligible: boolean;
  newArrival: boolean;
  discountPercentage?: number;
  warrantyAvailable: boolean;
  replacementAvailable: boolean;
  createdAt: string;
}

export type ProductAvailability = "in-stock" | "low-stock" | "out-of-stock";
export type DeliveryMode = "STORE_PICKUP" | "HOME_DELIVERY";
export type ReturnResolution = "WALLET_CREDIT" | "REPLACEMENT" | "MANUAL_REFUND";
export type ReturnRequestStatus =
  | "REQUESTED"
  | "UNDER_REVIEW"
  | "CONFIRMED"
  | "APPROVED"
  | "READY_TO_PICKUP"
  | "PICKUP_SCHEDULED"
  | "SHIPPED"
  | "PICKED_UP"
  | "DELIVERED"
  | "REFUNDED"
  | "REJECTED"
  | "CLOSED";
export type ReturnRequestType = "RETURN" | "REPLACEMENT";
export type BulkQuoteStatus =
  | "NEW"
  | "REVIEWING"
  | "QUOTED"
  | "NEGOTIATION"
  | "WON"
  | "LOST";

export interface Product {
  id: number;
  slug: string;
  name: string;
  brand: string;
  category: string;
  categorySlug: string;
  subcategory: string;
  subcategorySlug: string;
  subcategoryId: number;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  rating: number;
  reviewCount: number;
  stockQuantity: number;
  lowStock: boolean;
  availability: ProductAvailability;
  badge: string;
  shortDescription: string;
  description: string;
  heroTag: string;
  images: string[];
  tags: string[];
  featured: boolean;
  bestSeller: boolean;
  bulkEligible: boolean;
  newArrival: boolean;
  warrantyAvailable: boolean;
  replacementAvailable: boolean;
  createdAt: string;
}

export interface CartItem {
  id?: number;
  product: Product;
  quantity: number;
}

export interface AuthUser {
  id: number;
  fullName: string;
  email?: string | null;
  phoneNumber?: string | null;
  profileImageUrl?: string | null;
  role: string;
  preferredDeliveryMode?: DeliveryMode | null;
  walletBalance?: number;
}

export interface UserAddress {
  id: number;
  label: string;
  recipientName: string;
  phone: string;
  streetAddress: string;
  city: string;
  postalCode: string;
  defaultAddress: boolean;
}

export type ProductSort =
  | "featured"
  | "price-low"
  | "price-high"
  | "rating"
  | "newest"
  | "discount-high"
  | "name-asc"
  | "name-desc";

export type ProductAvailabilityFilter =
  | "all"
  | "in-stock"
  | "low-stock"
  | "out-of-stock";

export interface CategorySummary {
  id?: number;
  name: string;
  slug?: string;
  count: number;
  description: string;
  icon: string;
  image?: string;
  showInNavbar?: boolean;
  parentId?: number | null;
  isLeaf?: boolean;
  subcategories?: CategorySummary[];
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
  requiresProfileCompletion: boolean;
  showWelcomeGreeting: boolean;
}

export interface CartApiItem {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  image: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  stockQuantity: number;
}

export interface CartApiResponse {
  id: number;
  items: CartApiItem[];
  itemCount: number;
  subtotal: number;
}

export interface WishlistApiItem {
  id: number;
  productId: number;
  addedAt: string;
}

export interface WishlistApiResponse {
  id: number;
  items: WishlistApiItem[];
  products: ProductApiShape[];
  itemCount: number;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface OrderItem {
  productName: string;
  productSlug: string;
  image: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: string;
  deliveryMode: DeliveryMode;
  shippingName: string;
  email: string;
  phone: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  addressId?: number | null;
  deliverySlot?: string | null;
  priorityOrder: boolean;
  priorityNotes?: string | null;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  walletDebitAmount?: number;
  appliedCouponCode?: string | null;
  appliedDiscountAmount?: number | null;
  walletCreditAmount?: number | null;
  walletCreditEligibleAt?: string | null;
  walletCreditProcessed: boolean;
  whatsappTrackingMessage: string;
  createdAt: string;
  items: OrderItem[];
}

export interface DashboardOverview {
  productCount: number;
  orderCount: number;
  userCount: number;
  bulkInquiryCount: number;
  lowStockCount: number;
}

export interface InventoryItem {
  inventoryId: number;
  productId: number;
  productName: string;
  stockQuantity: number;
  lowStockThreshold: number;
  lowStock: boolean;
  updatedAt: string;
}

export interface AdminUser {
  id: number;
  fullName: string;
  email?: string | null;
  phoneNumber?: string | null;
  role: string;
  createdAt: string;
}

export interface AdminProductPayload {
  slug: string;
  name: string;
  brand: string;
  categoryId: number;
  price: number;
  originalPrice: number;
  shortDescription: string;
  description: string;
  rating: number;
  reviewCount: number;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  bulkEligible: boolean;
  warrantyAvailable: boolean;
  replacementAvailable: boolean;
  badge: string;
  heroTag: string;
  images: string[];
  tags: string[];
  stockQuantity: number;
  lowStockThreshold: number;
}

export interface CategoryPayload {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  parentId?: number | null;
  showInNavbar?: boolean;
  show_in_navbar?: boolean;
}

export interface Banner {
  id: number;
  imageUrl: string;
  placement?: "HOMEPAGE" | "SEASONAL_PICK" | string;
}

export interface BannerPayload {
  imageUrl: string;
}

export interface BrandLogo {
  id: number;
  brandName: string;
  logoUrl: string;
  displayOrder: number;
  active: boolean;
}

export interface BrandLogoPayload {
  brandName: string;
  logoUrl: string;
  displayOrder: number;
  active: boolean;
}

export interface WalletTransaction {
  id: number;
  type: "CREDIT" | "DEBIT";
  amount: number;
  description: string;
  referenceCode?: string | null;
  createdAt: string;
}

export interface WalletSummary {
  balance: number;
  transactions: WalletTransaction[];
}

export interface WalletCoupon {
  id: number;
  code: string;
  type: "WALLET_TOPUP" | "ORDER_CASHBACK" | "ORDER_DISCOUNT";
  amount: number;
  discountPercentage?: number | null;
  description?: string | null;
  assignedCustomerEmails?: string | null;
  active: boolean;
  rewardDelayMinutes: number;
  redemptionFrequency: "ONCE" | "WEEKLY" | "MONTHLY" | "YEARLY";
}

export interface WalletCouponRedemption {
  id: number;
  couponId: number;
  userId: number;
  userName: string;
  userEmail: string;
  redeemedCount: number;
  allowedRedemptions: number;
  remainingRedemptions: number;
}

export interface WalletCouponPayload {
  code: string;
  type: "WALLET_TOPUP" | "ORDER_CASHBACK" | "ORDER_DISCOUNT";
  amount: number;
  discountPercentage?: number;
  description?: string;
  assignedCustomerEmails?: string;
  active: boolean;
  rewardDelayMinutes: number;
  redemptionFrequency: "ONCE" | "WEEKLY" | "MONTHLY" | "YEARLY";
}

export interface WalletCouponGrantPayload {
  userId: number;
  additionalRedemptions: number;
}

export interface PincodeServiceabilityResult {
  pincode: string;
  serviceable: boolean;
  message: string;
}

export interface ServiceablePincode {
  id: number;
  pincode: string;
  label?: string | null;
  active: boolean;
}

export interface ServiceablePincodePayload {
  pincode: string;
  label?: string;
  active: boolean;
}

export interface ServiceRequestPayload {
  serviceKey: string;
  serviceName: string;
  customerName: string;
  phoneNumber: string;
  address: string;
  postalCode: string;
  description: string;
  problemImages: string[];
}

export interface ServiceRequest {
  id: number;
  userId?: number | null;
  userName?: string | null;
  serviceKey: string;
  serviceName: string;
  customerName: string;
  phoneNumber: string;
  address: string;
  postalCode: string;
  description: string;
  problemImages: string[];
  createdAt: string;
}

export interface ReturnRequestPayload {
  orderId: number;
  requestType: ReturnRequestType;
  reason: string;
  description: string;
  preferredResolution: ReturnResolution;
}

export interface ReturnRequestUpdatePayload {
  status: ReturnRequestStatus;
  adminNote?: string;
}

export interface ReturnRequest {
  id: number;
  orderId: number;
  orderNumber: string;
  orderStatus: string;
  customerName: string;
  phoneNumber: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  reason: string;
  description: string;
  requestType: ReturnRequestType;
  preferredResolution: ReturnResolution;
  status: ReturnRequestStatus;
  adminNote?: string | null;
  initiatedByAdmin: boolean;
  orderTotal: number;
  createdAt: string;
  reviewedAt?: string | null;
  refundedAt?: string | null;
  refundProcessed: boolean;
}

export interface SaveForLaterItem {
  id: number;
  quantity: number;
  createdAt: string;
  product: Product;
}

export interface SaveForLaterResponse {
  items: SaveForLaterItem[];
  itemCount: number;
}

export interface BulkInquiryLineItemPayload {
  productId?: number | null;
  productName?: string;
  quantity: number;
}

export interface BulkInquiryLineItem {
  id: number;
  productId?: number | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  estimatedLineTotal: number;
}

export interface BulkInquiry {
  id: number;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  productCategory: string;
  estimatedQuantity: number;
  deliveryCity?: string | null;
  budgetAmount?: number | null;
  rfqRequired: boolean;
  priorityRequest: boolean;
  requirements: string;
  estimatedTotal?: number | null;
  quoteStatus: BulkQuoteStatus;
  adminNotes?: string | null;
  createdAt: string;
  items: BulkInquiryLineItem[];
}
