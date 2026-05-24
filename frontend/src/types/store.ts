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
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  stockQuantity: number;
  lowStock: boolean;
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
  specifications?: Record<string, string>;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  brand: string;
  category: string;
  categorySlug: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  stockQuantity: number;
  lowStock: boolean;
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
}

export interface CartItem {
  id?: number;
  product: Product;
  quantity: number;
}

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  role: string;
}

export type ProductSort =
  | "featured"
  | "price-low"
  | "price-high"
  | "rating"
  | "newest";

export interface CategorySummary {
  id?: number;
  name: string;
  slug?: string;
  count: number;
  description: string;
  icon: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
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
  email: string;
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
  badge: string;
  heroTag: string;
  images: string[];
  tags: string[];
  stockQuantity: number;
  lowStockThreshold: number;
}
