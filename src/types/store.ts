export interface ProductSpec {
  label: string;
  value: string;
}

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
  specifications?: Record<string, string>;
}

export type ProductAvailability = "in-stock" | "low-stock" | "out-of-stock";

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
  specs: ProductSpec[];
  tags: string[];
  featured: boolean;
  bestSeller: boolean;
  bulkEligible: boolean;
  newArrival: boolean;
  warrantyAvailable: boolean;
  replacementAvailable: boolean;
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
  role: string;
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
  parentId?: number | null;
  isLeaf?: boolean;
  subcategories?: CategorySummary[];
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface OtpChallengeResponse {
  message: string;
  email: string;
  expiresAt: string;
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
  shippingName: string;
  email: string;
  phone: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
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
  specifications: Record<string, string>;
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
