import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import "../styles/pages/AdminDashboardPage.css";
import AdminWorkspaceNav from "../components/admin/AdminWorkspaceNav";
import { useAuth } from "../contexts/AuthContext";
import {
  createAdminProduct,
  deleteAdminOrder,
  deleteAdminProduct,
  fetchAdminInventory,
  fetchAdminOrders,
  fetchAdminProducts,
  fetchAdminUsers,
  fetchDashboardOverview,
  updateAdminOrderStatus,
  updateAdminProduct,
} from "../services/adminService";
import { fetchAdminReturnRequests } from "../services/returnService";
import { getCategories } from "../services/productService";
import {
  AdminProductPayload,
  AdminUser,
  CategorySummary,
  DashboardOverview,
  InventoryItem,
  Order,
  Product,
  ReturnRequest,
} from "../types/store";
import { optimizeImageFile } from "../utils/imageUpload";

type AdminView = "dashboard" | "inventory" | "orders";
type AdminOrderDeliveryFilter = "HOME_DELIVERY" | "STORE_PICKUP";
type AdminOrdersMode = "today" | "users";
type UserOrderAnalysisPeriod = "all" | "month" | "week";
type InventorySectionMode = "form" | "list";

interface ProductFormState {
  slug: string;
  name: string;
  brand: string;
  categoryId: string;
  subcategoryId: string;
  price: string;
  originalPrice: string;
  shortDescription: string;
  description: string;
  rating: string;
  reviewCount: string;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  bulkEligible: boolean;
  warrantyAvailable: boolean;
  replacementAvailable: boolean;
  badge: string;
  features: string;
  items: string;
  homepageSectionTags: string[];
  promoTags: string[];
  images: string;
  stockQuantity: string;
  lowStockThreshold: string;
}

const REFRESH_INTERVAL_MS = 60000;
const ORDER_STATUS_OPTIONS = [
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];
const STORE_PICKUP_STATUS_OPTIONS = ["CONFIRMED", "DELIVERED"];
const HOMEPAGE_SECTION_TAG_OPTIONS = [
  { label: "Hard-to-Find Products", value: "hard-to-find-products" },
  { label: "Everyday Essentials", value: "everyday-essentials" },
  { label: "Electrical Essentials", value: "electrical-essentials" },
  { label: "Hardware & Tools", value: "hardware-tools" },
  { label: "Plumbing & Bathroom", value: "plumbing-bathroom" },
];
const PROMO_TAG_OPTIONS = [
  { label: "Summer", value: "summer" },
  { label: "Monsoon", value: "monsoon" },
  { label: "Lighting", value: "lighting" },
  { label: "Contractor Deals", value: "contractor-deals" },
];
const USER_ORDER_ANALYSIS_OPTIONS: Array<{ label: string; value: UserOrderAnalysisPeriod }> = [
  { label: "All time", value: "all" },
  { label: "Monthly", value: "month" },
  { label: "Weekly", value: "week" },
];

const createEmptyFormState = (): ProductFormState => ({
  slug: "",
  name: "",
  brand: "",
  categoryId: "",
  subcategoryId: "",
  price: "",
  originalPrice: "",
  shortDescription: "",
  description: "",
  rating: "4.5",
  reviewCount: "0",
  featured: false,
  bestSeller: false,
  newArrival: true,
  bulkEligible: true,
  warrantyAvailable: true,
  replacementAvailable: true,
  badge: "New",
  features: "",
  items: "",
  homepageSectionTags: [],
  promoTags: [],
  images: "",
  stockQuantity: "0",
  lowStockThreshold: "5",
});

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const parseImageList = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const parseLineList = (value: string) =>
  value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

const parseCheckboxTags = (values: string[], options: { value: string }[]) =>
  options
    .map((option) => option.value)
    .filter((optionValue) => values.some((value) => value.toLowerCase() === optionValue.toLowerCase()));

const extractErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

const buildProductPayload = (form: ProductFormState): AdminProductPayload => ({
  slug: slugify(form.slug || form.name),
  name: form.name.trim(),
  brand: form.brand.trim(),
  categoryId: Number(form.subcategoryId || form.categoryId),
  price: Number(form.price),
  originalPrice: Number(form.originalPrice),
  shortDescription: form.shortDescription.trim(),
  description: form.description.trim(),
  rating: Number(form.rating),
  reviewCount: Number(form.reviewCount),
  featured: form.featured,
  bestSeller: form.bestSeller,
  newArrival: form.newArrival,
  bulkEligible: form.bulkEligible,
  warrantyAvailable: form.warrantyAvailable,
  replacementAvailable: form.replacementAvailable,
  badge: form.badge.trim(),
  heroTag: parseLineList(form.features)[0] || "Featured product",
  images: parseImageList(form.images),
  tags: Array.from(
    new Set([
      ...parseLineList(form.features),
      ...parseLineList(form.items),
      ...form.homepageSectionTags,
      ...form.promoTags,
    ]),
  ),
  stockQuantity: Number(form.stockQuantity),
  lowStockThreshold: Number(form.lowStockThreshold),
});

const createFormStateFromProduct = (
  product: Product,
  categories: CategorySummary[],
  inventory: InventoryItem[],
): ProductFormState => {
  const matchedCategory = categories.find((category) => category.slug === product.categorySlug);
  const matchedSubcategory =
    matchedCategory?.subcategories?.find(
      (subcategory) => subcategory.id === product.subcategoryId,
    ) ?? null;
  const inventoryItem = inventory.find((item) => item.productId === product.id);

  return {
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    categoryId: matchedCategory?.id ? String(matchedCategory.id) : "",
    subcategoryId: matchedSubcategory?.id ? String(matchedSubcategory.id) : "",
    price: String(product.price),
    originalPrice: String(product.originalPrice),
    shortDescription: product.shortDescription,
    description: product.description,
    rating: String(product.rating),
    reviewCount: String(product.reviewCount),
    featured: product.featured,
    bestSeller: product.bestSeller,
    newArrival: product.newArrival,
    bulkEligible: product.bulkEligible,
    warrantyAvailable: product.warrantyAvailable,
    replacementAvailable: product.replacementAvailable,
    badge: product.badge,
    features: product.heroTag ? product.heroTag : "",
    items: product.tags.join("\n"),
    homepageSectionTags: parseCheckboxTags(product.tags, HOMEPAGE_SECTION_TAG_OPTIONS),
    promoTags: parseCheckboxTags(product.tags, PROMO_TAG_OPTIONS),
    images: product.images.join("\n"),
    stockQuantity: String(product.stockQuantity),
    lowStockThreshold: String(inventoryItem?.lowStockThreshold ?? 5),
  };
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

const getStartOfDay = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

const isOrderInAnalysisPeriod = (order: Order, period: UserOrderAnalysisPeriod) => {
  if (period === "all") {
    return true;
  }

  const orderDate = new Date(order.createdAt);
  const now = new Date();

  if (period === "month") {
    return orderDate.getFullYear() === now.getFullYear() && orderDate.getMonth() === now.getMonth();
  }

  const today = getStartOfDay(now);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  return orderDate >= startOfWeek && orderDate <= now;
};

const getCurrentView = (pathname: string): AdminView => {
  if (pathname.includes("/inventory")) {
    return "inventory";
  }
  if (pathname.includes("/orders")) {
    return "orders";
  }
  return "dashboard";
};

const AdminDashboardPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, logout, user } = useAuth();
  const currentView = getCurrentView(location.pathname);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [productForm, setProductForm] = useState<ProductFormState>(createEmptyFormState);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [activeOrderDeliveryFilter, setActiveOrderDeliveryFilter] =
    useState<AdminOrderDeliveryFilter>("HOME_DELIVERY");
  const [ordersMode, setOrdersMode] = useState<AdminOrdersMode>("today");
  const [userOrderAnalysisPeriod, setUserOrderAnalysisPeriod] =
    useState<UserOrderAnalysisPeriod>("all");
  const [inventorySectionMode, setInventorySectionMode] =
    useState<InventorySectionMode>("form");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const handleAdminRequestError = useCallback((error: unknown, fallback: string) => {
    if (error instanceof AxiosError && error.response?.status === 401) {
      toast.error("Your admin session has expired. Please log in again.");
      logout();
      navigate("/admin/login", {
        replace: true,
        state: { from: location, adminOnly: true },
      });
      return;
    }

    if (error instanceof AxiosError && error.response?.status === 403) {
      toast.error(extractErrorMessage(error, "Admin role is required for this action. Please log in again."));
      logout();
      navigate("/admin/login", {
        replace: true,
        state: { from: location, adminOnly: true },
      });
      return;
    }

    toast.error(extractErrorMessage(error, fallback));
  }, [location, logout, navigate]);

  const loadAdminData = useCallback(async (options?: { silent?: boolean }) => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    if (!options?.silent) {
      setLoading(true);
    }

    try {
      const overviewData = await fetchDashboardOverview();
      const orderData = await fetchAdminOrders();
      const userData = await fetchAdminUsers();
      const inventoryData = await fetchAdminInventory();
      const productData = await fetchAdminProducts();
      const categoryData = await getCategories();
      const returnRequestData = await fetchAdminReturnRequests();

      setOverview(overviewData);
      setOrders(orderData);
      setUsers(userData);
      setInventory(inventoryData);
      setProducts(productData);
      setCategories(categoryData);
      setReturnRequests(returnRequestData);
    } catch (error) {
      handleAdminRequestError(error, "Could not load admin workspace.");
    } finally {
      if (!options?.silent) {
        setLoading(false);
      }
    }
  }, [handleAdminRequestError, isAdmin]);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      navigate("/admin/login", {
        replace: true,
        state: { from: location, adminOnly: true },
      });
      return;
    }

    void loadAdminData();

    const refreshTimer = window.setInterval(() => {
      void loadAdminData({ silent: true });
    }, REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(refreshTimer);
    };
  }, [isAdmin, loadAdminData, location, navigate]);

  const resetProductForm = () => {
    setEditingProductId(null);
    setProductForm(createEmptyFormState());
  };

  const selectedCategory = categories.find(
    (category) => String(category.id) === productForm.categoryId,
  );
  const availableSubcategories = selectedCategory?.subcategories || [];
  const productImages = parseImageList(productForm.images);

  const handleProductFormChange = (
    field: keyof ProductFormState,
    value: string | boolean,
  ) => {
    setProductForm((current) => ({
      ...current,
      ...(field === "categoryId" ? { subcategoryId: "" } : {}),
      [field]: value,
    }));
  };

  const handleEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setProductForm(createFormStateFromProduct(product, categories, inventory));
    setInventorySectionMode("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProductImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }

    const existingImages = parseImageList(productForm.images);
    if (existingImages.length + files.length > 3) {
      toast.error("You can upload up to 3 product images.");
      event.target.value = "";
      return;
    }

    setUploadingImages(true);
    try {
      const uploadedImages = await Promise.all(files.map(optimizeImageFile));
      handleProductFormChange("images", [...existingImages, ...uploadedImages].join("\n"));
    } catch (error) {
      toast.error(extractErrorMessage(error, "Unable to prepare one or more selected images."));
    } finally {
      setUploadingImages(false);
      event.target.value = "";
    }
  };

  const handleRemoveProductImage = (imageToRemove: string) => {
    handleProductFormChange(
      "images",
      productImages.filter((image) => image !== imageToRemove).join("\n"),
    );
  };

  const handleDeleteProduct = async (productId: number) => {
    const selectedProduct = products.find((product) => product.id === productId);
    if (!selectedProduct) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${selectedProduct.name}? This removes it from the catalog.`,
    );
    if (!confirmed) {
      return;
    }

    setDeletingProductId(productId);
    try {
      await deleteAdminProduct(productId);
      toast.success("Product removed from catalog.");
      await loadAdminData({ silent: true });
      if (editingProductId === productId) {
        resetProductForm();
      }
    } catch (error) {
      handleAdminRequestError(error, "Unable to delete that product.");
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleProductSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!productForm.categoryId) {
      toast.error("Choose a category before saving.");
      return;
    }

    if (availableSubcategories.length && !productForm.subcategoryId) {
      toast.error("Choose a subcategory before saving.");
      return;
    }

    const payload = buildProductPayload(productForm);
    if (!payload.images.length) {
      toast.error("Add at least one product image URL or path.");
      return;
    }

    setSavingProduct(true);
    try {
      if (editingProductId) {
        await updateAdminProduct(editingProductId, payload);
        toast.success("Product updated.");
      } else {
        await createAdminProduct(payload);
        toast.success("Product added to catalog.");
      }

      resetProductForm();
      await loadAdminData({ silent: true });
    } catch (error) {
      handleAdminRequestError(error, "We couldn't save that product.");
    } finally {
      setSavingProduct(false);
    }
  };

  const handleStatusChange = async (orderId: number, status: string) => {
    setStatusUpdatingId(orderId);
    try {
      await updateAdminOrderStatus(orderId, status);
      toast.success("Order status updated.");
      await loadAdminData({ silent: true });
    } catch (error) {
      handleAdminRequestError(error, "Unable to update the order status.");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    const selectedOrder = orders.find((order) => order.id === orderId);
    if (!selectedOrder) {
      return;
    }

    const confirmed = window.confirm(
      `Delete order ${selectedOrder.orderNumber.slice(0, 8)} from order history? This cannot be undone.`,
    );
    if (!confirmed) {
      return;
    }

    setDeletingOrderId(orderId);
    try {
      await deleteAdminOrder(orderId);
      toast.success("Order removed from history.");
      await loadAdminData({ silent: true });
    } catch (error) {
      handleAdminRequestError(error, "Unable to delete the order history.");
    } finally {
      setDeletingOrderId(null);
    }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const openOrders = orders.filter((order) =>
    ["CONFIRMED", "PROCESSING", "SHIPPED"].includes(order.status),
  ).length;
  const lowStockItems = inventory.filter((item) => item.lowStock);
  const totalUnits = inventory.reduce((sum, item) => sum + item.stockQuantity, 0);
  const catalogValue = products.reduce(
    (sum, product) => sum + product.price * product.stockQuantity,
    0,
  );
  const featuredProducts = products.filter((product) => product.featured).length;
  const newestOrders = [...orders]
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    )
    .slice(0, 5);
  const sortedInventory = [...inventory].sort(
    (left, right) => left.stockQuantity - right.stockQuantity,
  );
  const filteredOrders = orders.filter(
    (order) => order.deliveryMode === activeOrderDeliveryFilter,
  );
  const todaysOrders = filteredOrders.filter((order) => {
    const today = new Date();
    const orderDate = new Date(order.createdAt);
    return orderDate.toDateString() === today.toDateString();
  });
  const todaysOrderValue = todaysOrders.reduce(
    (sum, order) => sum + order.totalAmount,
    0,
  );
  const todaysProductUnits = todaysOrders.reduce(
    (sum, order) =>
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  );
  const todaysAverageOrderValue = todaysOrders.length
    ? todaysOrderValue / todaysOrders.length
    : 0;
  const todaysDeliveredOrders = todaysOrders.filter(
    (order) => order.status === "DELIVERED",
  ).length;
  const todaysOpenOrders = todaysOrders.filter((order) =>
    ["CONFIRMED", "PROCESSING", "SHIPPED"].includes(order.status),
  ).length;
  const todaysUniqueCustomers = new Set(
    todaysOrders.map((order) => order.email || order.phone || order.shippingName),
  ).size;
  const allTimeProductUnits = orders.reduce(
    (sum, order) =>
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  );
  const allTimeAverageOrderValue = orders.length ? totalRevenue / orders.length : 0;
  const allTimeDeliveredOrders = orders.filter(
    (order) => order.status === "DELIVERED",
  ).length;
  const allTimeOpenOrders = orders.filter((order) =>
    ["CONFIRMED", "PROCESSING", "SHIPPED"].includes(order.status),
  ).length;
  const allTimeUniqueCustomers = new Set(
    orders.map((order) => order.email || order.phone || order.shippingName),
  ).size;
  const salesSnapshot = ordersMode === "users"
    ? {
        eyebrow: "All-time analysis",
        title: "Sales snapshot",
        ordersLabel: "All-time orders",
        orderCount: orders.length,
        orderScope: "All delivery modes",
        productUnits: allTimeProductUnits,
        orderValue: totalRevenue,
        averageOrderValue: allTimeAverageOrderValue,
        openOrders: allTimeOpenOrders,
        deliveredOrders: allTimeDeliveredOrders,
        uniqueCustomers: allTimeUniqueCustomers,
        valueHint: "Total revenue till now",
      }
    : {
        eyebrow: "Today analysis",
        title: "Sales snapshot",
        ordersLabel: "Today's orders",
        orderCount: todaysOrders.length,
        orderScope: activeOrderDeliveryFilter === "HOME_DELIVERY" ? "Home delivery" : "Store pickup",
        productUnits: todaysProductUnits,
        orderValue: todaysOrderValue,
        averageOrderValue: todaysAverageOrderValue,
        openOrders: todaysOpenOrders,
        deliveredOrders: todaysDeliveredOrders,
        uniqueCustomers: todaysUniqueCustomers,
        valueHint: "Revenue from today's orders",
      };
  const scopedPulseOrders = ordersMode === "users" ? orders : todaysOrders;
  const scopedPulseReturns = ordersMode === "users"
    ? returnRequests
    : returnRequests.filter((request) => {
        const today = new Date();
        const requestDate = new Date(request.createdAt);
        return requestDate.toDateString() === today.toDateString();
      });
  const opsPulse = {
    eyebrow: ordersMode === "users" ? "All-time pulse" : "Ops pulse",
    totalOrders: scopedPulseOrders.length,
    delivered: scopedPulseOrders.filter((order) => order.status === "DELIVERED").length,
    cancelled: scopedPulseOrders.filter((order) => order.status === "CANCELLED").length,
    processing: scopedPulseOrders.filter((order) => order.status === "PROCESSING").length,
    returned: scopedPulseReturns.filter(
      (request) =>
        request.requestType === "RETURN" &&
        ["PICKED_UP", "REFUNDED"].includes(request.status),
    ).length,
    replaced: scopedPulseReturns.filter(
      (request) =>
        request.requestType === "REPLACEMENT" &&
        request.status === "DELIVERED",
    ).length,
  };
  const homeDeliveryOrderCount = orders.filter(
    (order) => order.deliveryMode === "HOME_DELIVERY",
  ).length;
  const storePickupOrderCount = orders.filter(
    (order) => order.deliveryMode === "STORE_PICKUP",
  ).length;
  const ordersByUser = users.map((adminUser) => ({
    user: adminUser,
    orders: orders.filter((order) => {
      const contactMatch = adminUser.email
        ? order.email?.toLowerCase() === adminUser.email.toLowerCase()
        : adminUser.phoneNumber && order.phone === adminUser.phoneNumber;
      const nameMatch = order.shippingName === adminUser.fullName;
      return contactMatch || nameMatch;
    }),
  }));
  const scopedOrdersByUser = ordersByUser.map((entry) => ({
    ...entry,
    scopedOrders: entry.orders.filter((order) =>
      isOrderInAnalysisPeriod(order, userOrderAnalysisPeriod),
    ),
  }));
  const selectedUserOrders = scopedOrdersByUser.find((entry) => entry.user.id === selectedUserId) ?? null;
  const selectedUserScopedOrders = selectedUserOrders?.scopedOrders || [];
  const selectedUserTotalBuy = selectedUserScopedOrders.reduce(
    (total, order) => total + order.totalAmount,
    0,
  );
  const selectedUserUnits = selectedUserScopedOrders.reduce(
    (total, order) =>
      total + order.items.reduce((itemTotal, item) => itemTotal + item.quantity, 0),
    0,
  );
  const selectedUserAverageOrderValue = selectedUserScopedOrders.length
    ? selectedUserTotalBuy / selectedUserScopedOrders.length
    : 0;

  const renderDashboardView = () => (
    <>
      <div className="admin-kpi-grid">
        <article className="store-card admin-kpi-card">
          <span>Total sales</span>
          <strong>{formatCurrency(totalRevenue)}</strong>
          <p>{openOrders} open orders still need action.</p>
        </article>
        <article className="store-card admin-kpi-card">
          <span>Catalog coverage</span>
          <strong>{overview?.productCount ?? 0}</strong>
          <p>{featuredProducts} featured SKUs are highlighted on the storefront.</p>
        </article>
        <article className="store-card admin-kpi-card">
          <span>Inventory depth</span>
          <strong>{totalUnits}</strong>
          <p>{lowStockItems.length} item(s) are below their safety threshold.</p>
        </article>
        <article className="store-card admin-kpi-card">
          <span>Customer base</span>
          <strong>{overview?.userCount ?? 0}</strong>
          <p>{overview?.bulkInquiryCount ?? 0} bulk inquiries are waiting in the pipeline.</p>
        </article>
      </div>

      <div className="admin-overview-grid">
        <article className="store-card admin-panel">
          <div className="admin-panel__heading">
            <div>
              <span className="eyebrow">Inventory health</span>
              <h2>Stock pressure points</h2>
            </div>
          </div>
          <div className="admin-health-list">
            {sortedInventory.slice(0, 5).map((item) => (
              <div key={item.inventoryId} className="admin-health-item">
                <div>
                  <strong>{item.productName}</strong>
                  <span>Threshold {item.lowStockThreshold} units</span>
                </div>
                <div className="admin-health-item__status">
                  <span>{item.stockQuantity} left</span>
                  <div className="admin-meter">
                    <div
                      className={`admin-meter__bar ${item.lowStock ? "is-low" : ""}`}
                      style={{
                        width: `${Math.min(100, Math.max(10, item.stockQuantity * 4))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="store-card admin-panel">
          <div className="admin-panel__heading">
            <div>
              <span className="eyebrow">Order stream</span>
              <h2>Latest customer checkouts</h2>
            </div>
          </div>
          <div className="admin-order-stream">
            {newestOrders.map((order) => (
              <div key={order.id} className="admin-order-stream__item">
                <div>
                  <strong>{order.shippingName}</strong>
                  <span>
                    {order.orderNumber.slice(0, 8)} · {formatDateTime(order.createdAt)}
                  </span>
                </div>
                <div>
                  <strong>{formatCurrency(order.totalAmount)}</strong>
                  <span>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="admin-overview-grid admin-overview-grid--secondary">
        <article className="store-card admin-panel">
          <div className="admin-panel__heading">
            <div>
              <span className="eyebrow">Commercial snapshot</span>
              <h2>Store health summary</h2>
            </div>
          </div>
          <div className="admin-summary-stack">
            <div>
              <span>Catalog inventory value</span>
              <strong>{formatCurrency(catalogValue)}</strong>
            </div>
            <div>
              <span>Average order value</span>
              <strong>
                {orders.length ? formatCurrency(totalRevenue / orders.length) : formatCurrency(0)}
              </strong>
            </div>
            <div>
              <span>Admin-visible customers</span>
              <strong>{users.length}</strong>
            </div>
          </div>
        </article>
      </div>
    </>
  );

  const renderInventoryView = () => (
    <div className="admin-inventory-stack">
      {inventorySectionMode === "form" ? (
        <section className="store-card admin-panel admin-form-panel admin-panel--wide">
          <div className="admin-panel__heading admin-panel__heading--mobile-action">
            <div>
              <span className="eyebrow">Catalog studio</span>
              <h2>{editingProductId ? "Edit product" : "Add a new product"}</h2>
            </div>
            <div className="admin-table-actions">
              <button
                className="link-button admin-mode-toggle-button"
                type="button"
                onClick={() => setInventorySectionMode("list")}
              >
                View products
              </button>
              {editingProductId ? (
                <button className="link-button" type="button" onClick={resetProductForm}>
                  Reset form
                </button>
              ) : null}
            </div>
          </div>

          <form className="admin-product-form" onSubmit={handleProductSubmit}>
            <div className="form-grid">
            <label>
              Product name
              <input
                value={productForm.name}
                onChange={(event) => handleProductFormChange("name", event.target.value)}
                placeholder="VoltMart Pro Dock"
                required
              />
            </label>
            <label>
              Brand
              <input
                value={productForm.brand}
                onChange={(event) => handleProductFormChange("brand", event.target.value)}
                placeholder="VoltMart"
                required
              />
            </label>
            <label>
              Category
              <select
                value={productForm.categoryId}
                onChange={(event) => handleProductFormChange("categoryId", event.target.value)}
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Subcategory
              <select
                value={productForm.subcategoryId}
                onChange={(event) =>
                  handleProductFormChange("subcategoryId", event.target.value)
                }
                disabled={!availableSubcategories.length}
                required={Boolean(availableSubcategories.length)}
              >
                <option value="">
                  {availableSubcategories.length
                    ? "Select subcategory"
                    : "No subcategories for this category"}
                </option>
                {availableSubcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Price
              <input
                type="number"
                min="0"
                step="0.01"
                value={productForm.price}
                onChange={(event) => handleProductFormChange("price", event.target.value)}
                required
              />
            </label>
            <label>
              Original price
              <input
                type="number"
                min="0"
                step="0.01"
                value={productForm.originalPrice}
                onChange={(event) =>
                  handleProductFormChange("originalPrice", event.target.value)
                }
                required
              />
            </label>
            <label>
              Rating
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={productForm.rating}
                onChange={(event) => handleProductFormChange("rating", event.target.value)}
                required
              />
            </label>
            <label>
              Review count
              <input
                type="number"
                min="0"
                value={productForm.reviewCount}
                onChange={(event) =>
                  handleProductFormChange("reviewCount", event.target.value)
                }
                required
              />
            </label>
            <label>
              Stock quantity
              <input
                type="number"
                min="0"
                value={productForm.stockQuantity}
                onChange={(event) =>
                  handleProductFormChange("stockQuantity", event.target.value)
                }
                required
              />
            </label>
            <label>
              Low-stock threshold
              <input
                type="number"
                min="0"
                value={productForm.lowStockThreshold}
                onChange={(event) =>
                  handleProductFormChange("lowStockThreshold", event.target.value)
                }
                required
              />
            </label>
            <label>
              Badge
              <input
                value={productForm.badge}
                onChange={(event) => handleProductFormChange("badge", event.target.value)}
                required
              />
            </label>
            <label className="form-grid__wide">
              Short description
              <textarea
                rows={3}
                value={productForm.shortDescription}
                onChange={(event) =>
                  handleProductFormChange("shortDescription", event.target.value)
                }
                required
              />
            </label>
            <label className="form-grid__wide">
              Full description
              <textarea
                rows={5}
                value={productForm.description}
                onChange={(event) =>
                  handleProductFormChange("description", event.target.value)
                }
                required
              />
            </label>
            <label className="form-grid__wide">
              Product images
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleProductImageUpload}
                disabled={uploadingImages || productImages.length >= 3}
              />
              <span className="admin-field-hint">
                Upload up to 3 images from your device. You can also paste image URLs below.
              </span>
              <textarea
                rows={4}
                value={productForm.images}
                onChange={(event) => handleProductFormChange("images", event.target.value)}
                placeholder="One image path, URL, or uploaded image per line"
                required
              />
              {productImages.length ? (
                <div className="admin-image-preview-grid">
                  {productImages.map((image, index) => (
                    <div key={`${index}-${image.slice(0, 20)}`} className="admin-image-preview-card">
                      <img src={image} alt={`Product preview ${index + 1}`} />
                      <button
                        className="link-button"
                        type="button"
                        onClick={() => handleRemoveProductImage(image)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </label>
            <label className="form-grid__wide">
              Features
              <textarea
                rows={3}
                value={productForm.features}
                onChange={(event) => handleProductFormChange("features", event.target.value)}
                placeholder="One feature per line or comma"
              />
              <span className="admin-field-hint">Optional. These will render as highlighted feature chips.</span>
            </label>
            <label className="form-grid__wide">
              Items in the box
              <textarea
                rows={3}
                value={productForm.items}
                onChange={(event) => handleProductFormChange("items", event.target.value)}
                placeholder="One item per line or comma"
              />
              <span className="admin-field-hint">Optional. These are shown in the product details highlight list.</span>
            </label>
            <div className="form-grid__wide admin-checkbox-group">
              <strong>Homepage sections</strong>
              <div className="admin-flag-grid">
                {HOMEPAGE_SECTION_TAG_OPTIONS.map((option) => (
                  <label key={option.value} className="admin-toggle">
                    <input
                      type="checkbox"
                      checked={productForm.homepageSectionTags.includes(option.value)}
                      onChange={(event) =>
                        setProductForm((current) => ({
                          ...current,
                          homepageSectionTags: event.target.checked
                            ? [...current.homepageSectionTags, option.value]
                            : current.homepageSectionTags.filter((tag) => tag !== option.value),
                        }))
                      }
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="form-grid__wide admin-checkbox-group">
              <strong>Promotional banners</strong>
              <div className="admin-flag-grid">
                {PROMO_TAG_OPTIONS.map((option) => (
                  <label key={option.value} className="admin-toggle">
                    <input
                      type="checkbox"
                      checked={productForm.promoTags.includes(option.value)}
                      onChange={(event) =>
                        setProductForm((current) => ({
                          ...current,
                          promoTags: event.target.checked
                            ? [...current.promoTags, option.value]
                            : current.promoTags.filter((tag) => tag !== option.value),
                        }))
                      }
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
            </div>

            <div className="admin-flag-grid">
              {[
                ["featured", "Featured"],
                ["bestSeller", "Best seller"],
                ["newArrival", "New arrival"],
                ["bulkEligible", "Bulk eligible"],
                ["warrantyAvailable", "Warranty available"],
                ["replacementAvailable", "Replacement available"],
              ].map(([field, label]) => (
                <label key={field} className="admin-toggle">
                  <input
                    type="checkbox"
                    checked={productForm[field as keyof ProductFormState] as boolean}
                    onChange={(event) =>
                      handleProductFormChange(
                        field as keyof ProductFormState,
                        event.target.checked,
                      )
                    }
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>

            <div className="admin-form-actions">
              <button className="button" type="submit" disabled={savingProduct}>
                {savingProduct ? (
                  <span className="button-loading">
                    <span className="button-loading__spinner" aria-hidden="true" />
                    {editingProductId ? "Updating..." : "Saving..."}
                  </span>
                ) : editingProductId ? (
                  "Update product"
                ) : (
                  "Add product"
                )}
              </button>
              <button className="link-button" type="button" onClick={resetProductForm}>
                Clear
              </button>
            </div>
          </form>
        </section>
      ) : (
        <section className="store-card admin-panel admin-panel--wide">
          <div className="admin-panel__heading admin-panel__heading--mobile-action">
            <div>
              <span className="eyebrow">Product management</span>
              <h2>Manage catalog and inventory</h2>
            </div>
            <button
              className="link-button admin-mode-toggle-button"
              type="button"
              onClick={() => {
                resetProductForm();
                setInventorySectionMode("form");
              }}
            >
              Add product
            </button>
          </div>
          <div className="admin-table admin-table--product-list">
            <table>
              <thead>
                <tr>
                  <th>SL No</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Subcategory</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={product.id}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{product.name}</strong>
                      <div>{product.brand}</div>
                    </td>
                    <td>{product.category}</td>
                    <td>{product.subcategory}</td>
                    <td>{formatCurrency(product.price)}</td>
                    <td>{product.stockQuantity}</td>
                    <td>
                      <span
                        className={`admin-status-pill ${
                          product.lowStock ? "is-warning" : "is-success"
                        }`}
                      >
                        {product.lowStock ? "Low stock" : "Healthy"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <button
                          className="link-button"
                          type="button"
                          onClick={() => handleEditProduct(product)}
                        >
                          Edit
                        </button>
                        <button
                          className="link-button admin-danger-button"
                          type="button"
                          disabled={deletingProductId === product.id}
                          onClick={() => void handleDeleteProduct(product.id)}
                        >
                          {deletingProductId === product.id ? "Removing..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );

  const renderOrdersView = () => (
    <div className="admin-orders-layout">
      <section className="store-card admin-panel admin-panel--full">
        <div className="admin-panel__heading">
          <div>
            <span className="eyebrow">Order operations</span>
            <h2>Realtime order management</h2>
          </div>
          <div className="admin-order-filter-group" aria-label="Order views">
            <button
              type="button"
              className={ordersMode === "today" ? "admin-order-filter-button is-active" : "admin-order-filter-button"}
              onClick={() => {
                setOrdersMode("today");
                setExpandedOrderId(null);
              }}
            >
              Today's orders
            </button>
            <button
              type="button"
              className={ordersMode === "users" ? "admin-order-filter-button is-active" : "admin-order-filter-button"}
              onClick={() => {
                setOrdersMode("users");
                setExpandedOrderId(null);
              }}
            >
              User-wise orders
            </button>
          </div>
        </div>

        {ordersMode === "today" ? (
          <>
            <div className="admin-order-filter-group" aria-label="Order delivery filters" style={{ marginBottom: 16 }}>
              <button
                type="button"
                className={
                  activeOrderDeliveryFilter === "HOME_DELIVERY"
                    ? "admin-order-filter-button is-active"
                    : "admin-order-filter-button"
                }
                onClick={() => {
                  setActiveOrderDeliveryFilter("HOME_DELIVERY");
                  setExpandedOrderId(null);
                }}
              >
                Home delivery ({homeDeliveryOrderCount})
              </button>
              <button
                type="button"
                className={
                  activeOrderDeliveryFilter === "STORE_PICKUP"
                    ? "admin-order-filter-button is-active"
                    : "admin-order-filter-button"
                }
                onClick={() => {
                  setActiveOrderDeliveryFilter("STORE_PICKUP");
                  setExpandedOrderId(null);
                }}
              >
                Store pickup ({storePickupOrderCount})
              </button>
            </div>
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Placed</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Update</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {todaysOrders.length ? todaysOrders.map((order) => (
                    <React.Fragment key={order.id}>
                      <tr>
                        <td>
                          <button
                            className="admin-order-toggle"
                            type="button"
                            onClick={() =>
                              setExpandedOrderId((current) => (current === order.id ? null : order.id))
                            }
                          >
                            <strong>{order.orderNumber.slice(0, 8)}</strong>
                            <span>{expandedOrderId === order.id ? "Hide details" : "Show details"}</span>
                          </button>
                          <div>{order.items.length} item(s)</div>
                        </td>
                        <td>
                          <strong>{order.shippingName}</strong>
                          <div>{order.email}</div>
                        </td>
                        <td>{formatDateTime(order.createdAt)}</td>
                        <td>{formatCurrency(order.totalAmount)}</td>
                        <td>
                          <span className="admin-status-pill">{order.status}</span>
                        </td>
                        <td>
                          <select
                            value={order.status}
                            disabled={statusUpdatingId === order.id}
                            onChange={(event) => void handleStatusChange(order.id, event.target.value)}
                          >
                            {(order.deliveryMode === "STORE_PICKUP"
                              ? STORE_PICKUP_STATUS_OPTIONS
                              : ORDER_STATUS_OPTIONS
                            ).map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <button
                            className="link-button admin-danger-button"
                            type="button"
                            disabled={deletingOrderId === order.id}
                            onClick={() => void handleDeleteOrder(order.id)}
                          >
                            {deletingOrderId === order.id ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                      {expandedOrderId === order.id ? (
                        <tr className="admin-order-details-row">
                          <td colSpan={7}>
                            <div className="admin-order-details">
                              <section className="admin-order-details__section">
                                <span className="eyebrow">User details</span>
                                <strong>{order.shippingName}</strong>
                                <p>{order.email}</p>
                                <p>{order.phone}</p>
                              </section>
                              <section className="admin-order-details__section">
                                <span className="eyebrow">Order details</span>
                                <p>Order no: {order.orderNumber}</p>
                                <p>Status: {order.status}</p>
                                <p>Placed: {formatDateTime(order.createdAt)}</p>
                                <p>Total: {formatCurrency(order.totalAmount)}</p>
                                {order.appliedCouponCode ? (
                                  <p>Coupon: {order.appliedCouponCode}</p>
                                ) : null}
                              </section>
                              <section className="admin-order-details__section">
                                <span className="eyebrow">Delivery details</span>
                                <p>{order.shippingAddress}</p>
                                <p>{order.city}, {order.postalCode}</p>
                              </section>
                              <section className="admin-order-details__section admin-order-details__section--full">
                                <span className="eyebrow">Items</span>
                                <div className="admin-order-item-list">
                                  {order.items.map((item) => (
                                    <div key={`${order.id}-${item.productSlug}`} className="admin-order-item">
                                      <strong>{item.productName}</strong>
                                      <span>{item.quantity} qty</span>
                                      <span>{formatCurrency(item.unitPrice)}</span>
                                    </div>
                                  ))}
                                </div>
                              </section>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </React.Fragment>
                  )) : (
                    <tr>
                      <td colSpan={7}>
                        <div className="admin-empty-note">
                          No orders found for today in this delivery mode.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="admin-orders-layout">
            <article className="store-card admin-panel admin-panel--user-ledger">
              <div className="admin-panel__heading">
                <div>
                  <span className="eyebrow">Customer ledger</span>
                  <h2>All users</h2>
                </div>
              </div>
              <div className="admin-order-filter-group" aria-label="User order analysis period" style={{ marginBottom: 16 }}>
                {USER_ORDER_ANALYSIS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={
                      userOrderAnalysisPeriod === option.value
                        ? "admin-order-filter-button is-active"
                        : "admin-order-filter-button"
                    }
                    onClick={() => {
                      setUserOrderAnalysisPeriod(option.value);
                      setExpandedOrderId(null);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="admin-user-list">
                {scopedOrdersByUser.map(({ user: adminUser, scopedOrders }, index) => (
                  <button
                    key={adminUser.id}
                    type="button"
                    className="admin-user-list__item"
                    onClick={() => {
                      setSelectedUserId(adminUser.id);
                      setExpandedOrderId(null);
                    }}
                    style={{ width: "100%", textAlign: "left", background: "transparent", border: "none" }}
                  >
                    <span className="admin-user-list__serial">{index + 1}</span>
                    <div>
                      <strong>{adminUser.fullName}</strong>
                      <span>{adminUser.email || adminUser.phoneNumber || "No contact info"}</span>
                    </div>
                    <span>{scopedOrders.length} orders</span>
                  </button>
                ))}
              </div>
            </article>

            <article className="store-card admin-panel admin-panel--full">
              <div className="admin-panel__heading">
                <div>
                  <span className="eyebrow">User orders</span>
                  <h2>{selectedUserOrders?.user.fullName || "Select a user"}</h2>
                </div>
              </div>
              {selectedUserOrders ? (
                <>
                  <div className="admin-summary-stack">
                    <div>
                      <span>Email</span>
                      <strong>{selectedUserOrders.user.email || "-"}</strong>
                    </div>
                    <div>
                      <span>Phone</span>
                      <strong>{selectedUserOrders.user.phoneNumber || "-"}</strong>
                    </div>
                    <div>
                      <span>Total orders</span>
                      <strong>{selectedUserScopedOrders.length}</strong>
                    </div>
                    <div>
                      <span>Total buy</span>
                      <strong>{formatCurrency(selectedUserTotalBuy)}</strong>
                    </div>
                    <div>
                      <span>Product units</span>
                      <strong>{selectedUserUnits}</strong>
                    </div>
                    <div>
                      <span>Average order</span>
                      <strong>{formatCurrency(selectedUserAverageOrderValue)}</strong>
                    </div>
                  </div>
                  <div className="admin-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Order</th>
                          <th>Placed</th>
                          <th>Status</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedUserScopedOrders.length ? selectedUserScopedOrders
                          .slice()
                          .sort(
                            (left, right) =>
                              new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
                          )
                          .map((order) => (
                          <tr key={order.id}>
                            <td>
                              <strong>{order.orderNumber.slice(0, 8)}</strong>
                              <div>{order.shippingAddress}</div>
                            </td>
                            <td>{formatDateTime(order.createdAt)}</td>
                            <td>{order.status}</td>
                            <td>{formatCurrency(order.totalAmount)}</td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={4}>
                              <div className="admin-empty-note">
                                No orders found for this user in the selected analysis period.
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="admin-empty-note">Choose a user to view all order details.</div>
              )}
            </article>
          </div>
        )}
      </section>

      <section className="admin-side-stack admin-side-stack--orders-summary">
        <article className="store-card admin-panel">
          <div className="admin-panel__heading">
            <div>
              <span className="eyebrow">{opsPulse.eyebrow}</span>
              <h2>Fulfilment snapshot</h2>
            </div>
          </div>
          <div className="admin-form-actions" style={{ marginBottom: 12 }}>
            <Link className="button" to="/admin/returns">
              Open returns
            </Link>
          </div>
          <div className="admin-summary-stack">
            <div>
              <span>Total orders</span>
              <strong>{opsPulse.totalOrders}</strong>
            </div>
            <div>
              <span>Delivered orders</span>
              <strong>{opsPulse.delivered}</strong>
            </div>
            <div>
              <span>Cancelled orders</span>
              <strong>{opsPulse.cancelled}</strong>
            </div>
            <div>
              <span>Returned</span>
              <strong>{opsPulse.returned}</strong>
            </div>
            <div>
              <span>Replaced</span>
              <strong>{opsPulse.replaced}</strong>
            </div>
            <div>
              <span>Processing</span>
              <strong>{opsPulse.processing}</strong>
            </div>
          </div>
        </article>
        <article className="store-card admin-panel">
          <div className="admin-panel__heading">
            <div>
              <span className="eyebrow">{salesSnapshot.eyebrow}</span>
              <h2>{salesSnapshot.title}</h2>
            </div>
          </div>
          <div className="admin-today-analytics">
            <article className="admin-today-analytics__card">
              <span>{salesSnapshot.ordersLabel}</span>
              <strong>{salesSnapshot.orderCount}</strong>
              <small>{salesSnapshot.orderScope}</small>
            </article>
            <article className="admin-today-analytics__card">
              <span>Products ordered</span>
              <strong>{salesSnapshot.productUnits}</strong>
              <small>Total item quantity</small>
            </article>
            <article className="admin-today-analytics__card">
              <span>Value sold</span>
              <strong>{formatCurrency(salesSnapshot.orderValue)}</strong>
              <small>{salesSnapshot.valueHint}</small>
            </article>
            <article className="admin-today-analytics__card">
              <span>Avg order value</span>
              <strong>{formatCurrency(salesSnapshot.averageOrderValue)}</strong>
              <small>Sales efficiency</small>
            </article>
            <article className="admin-today-analytics__card">
              <span>Open orders</span>
              <strong>{salesSnapshot.openOrders}</strong>
              <small>Needs fulfilment action</small>
            </article>
            <article className="admin-today-analytics__card">
              <span>Delivered</span>
              <strong>{salesSnapshot.deliveredOrders}</strong>
              <small>{ordersMode === "users" ? "Completed all time" : "Completed today"}</small>
            </article>
            <article className="admin-today-analytics__card">
              <span>Customers</span>
              <strong>{salesSnapshot.uniqueCustomers}</strong>
              <small>{ordersMode === "users" ? "Unique buyers all time" : "Unique buyers today"}</small>
            </article>
          </div>
        </article>
      </section>
    </div>
  );

  return (
    <section className="shell section page-section">
      <div className="page-header admin-page-header">
        <div>
          <span className="eyebrow">Admin workspace</span>
          <h1>VoltMart control center</h1>
        </div>
        <div className="admin-page-header__actions">
          <span>{user?.fullName || "Admin"}</span>
        </div>
      </div>

      <AdminWorkspaceNav />

      {loading && !overview ? (
        <div className="store-card empty-state">
          <h3>Loading admin workspace...</h3>
          <p>Gathering live order, stock, and catalog data.</p>
        </div>
      ) : null}

      {!loading || overview ? (
        <>
          {currentView === "dashboard" ? renderDashboardView() : null}
          {currentView === "inventory" ? renderInventoryView() : null}
          {currentView === "orders" ? renderOrdersView() : null}
        </>
      ) : null}
    </section>
  );
};

export default AdminDashboardPage;
