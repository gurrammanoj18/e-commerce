import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import "../styles/pages/AdminDashboardPage.css";
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
import { getCategories } from "../services/productService";
import {
  AdminProductPayload,
  AdminUser,
  CategorySummary,
  DashboardOverview,
  InventoryItem,
  Order,
  Product,
} from "../types/store";

type AdminView = "dashboard" | "inventory" | "orders";

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
  specifications: string;
  rating: string;
  reviewCount: string;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  bulkEligible: boolean;
  warrantyAvailable: boolean;
  replacementAvailable: boolean;
  badge: string;
  heroTag: string;
  images: string;
  tags: string;
  stockQuantity: string;
  lowStockThreshold: string;
}

interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
}

const REFRESH_INTERVAL_MS = 15000;
const ORDER_STATUS_OPTIONS = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
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
  specifications: "Processor: \nConnectivity: \nWarranty: ",
  rating: "4.5",
  reviewCount: "0",
  featured: false,
  bestSeller: false,
  newArrival: true,
  bulkEligible: true,
  warrantyAvailable: true,
  replacementAvailable: true,
  badge: "New",
  heroTag: "Operational launch",
  images: "",
  tags: "featured, admin-managed",
  stockQuantity: "0",
  lowStockThreshold: "5",
});

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const parseTagList = (value: string) =>
  value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

const parseImageList = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error(`Unable to read ${file.name}`));
    reader.readAsDataURL(file);
  });

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to process selected image."));
    image.src = src;
  });

const optimizeImageFile = async (file: File) => {
  const sourceDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(sourceDataUrl);
  const maxDimension = 1200;
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    return sourceDataUrl;
  }

  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.78);
};

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

const parseSpecifications = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((accumulator, line) => {
      const [label, ...rest] = line.split(":");
      if (!label || !rest.length) {
        return accumulator;
      }
      accumulator[label.trim()] = rest.join(":").trim();
      return accumulator;
    }, {});

const buildProductPayload = (form: ProductFormState): AdminProductPayload => ({
  slug: slugify(form.slug || form.name),
  name: form.name.trim(),
  brand: form.brand.trim(),
  categoryId: Number(form.subcategoryId || form.categoryId),
  price: Number(form.price),
  originalPrice: Number(form.originalPrice),
  shortDescription: form.shortDescription.trim(),
  description: form.description.trim(),
  specifications: parseSpecifications(form.specifications),
  rating: Number(form.rating),
  reviewCount: Number(form.reviewCount),
  featured: form.featured,
  bestSeller: form.bestSeller,
  newArrival: form.newArrival,
  bulkEligible: form.bulkEligible,
  warrantyAvailable: form.warrantyAvailable,
  replacementAvailable: form.replacementAvailable,
  badge: form.badge.trim(),
  heroTag: form.heroTag.trim(),
  images: parseImageList(form.images),
  tags: parseTagList(form.tags),
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
    specifications: product.specs.map((spec) => `${spec.label}: ${spec.value}`).join("\n"),
    rating: String(product.rating),
    reviewCount: String(product.reviewCount),
    featured: product.featured,
    bestSeller: product.bestSeller,
    newArrival: product.newArrival,
    bulkEligible: product.bulkEligible,
    warrantyAvailable: product.warrantyAvailable,
    replacementAvailable: product.replacementAvailable,
    badge: product.badge,
    heroTag: product.heroTag,
    images: product.images.join("\n"),
    tags: product.tags.join(", "),
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
  const { logout, user } = useAuth();
  const currentView = getCurrentView(location.pathname);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
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
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(
    Math.floor(REFRESH_INTERVAL_MS / 1000),
  );
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const previousSnapshot = useRef<{
    overview: DashboardOverview;
    inventory: InventoryItem[];
    orders: Order[];
  } | null>(null);

  const loadAdminData = async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setLoading(true);
    }

    try {
      const [
        overviewData,
        orderData,
        userData,
        inventoryData,
        productData,
        categoryData,
      ] = await Promise.all([
        fetchDashboardOverview(),
        fetchAdminOrders(),
        fetchAdminUsers(),
        fetchAdminInventory(),
        fetchAdminProducts(),
        getCategories(),
      ]);

      setOverview(overviewData);
      setOrders(orderData);
      setUsers(userData);
      setInventory(inventoryData);
      setProducts(productData);
      setCategories(categoryData);
      setLastUpdatedAt(new Date().toISOString());
      setSecondsUntilRefresh(Math.floor(REFRESH_INTERVAL_MS / 1000));

      const snapshot = previousSnapshot.current;
      const liveEvents: ActivityItem[] = [];

      if (snapshot) {
        if (overviewData.orderCount > snapshot.overview.orderCount) {
          liveEvents.push({
            id: `orders-${Date.now()}`,
            title: "New order activity",
            detail: `${overviewData.orderCount - snapshot.overview.orderCount} order(s) arrived since the last sync.`,
            timestamp: new Date().toISOString(),
          });
        }

        if (overviewData.userCount > snapshot.overview.userCount) {
          liveEvents.push({
            id: `users-${Date.now()}`,
            title: "Customer base grew",
            detail: `${overviewData.userCount - snapshot.overview.userCount} new user(s) joined the store.`,
            timestamp: new Date().toISOString(),
          });
        }

        const previousLowStockIds = new Set(
          snapshot.inventory.filter((item) => item.lowStock).map((item) => item.inventoryId),
        );

        inventoryData
          .filter((item) => item.lowStock && !previousLowStockIds.has(item.inventoryId))
          .slice(0, 2)
          .forEach((item) => {
            liveEvents.push({
              id: `inventory-${item.inventoryId}-${Date.now()}`,
              title: "Inventory alert",
              detail: `${item.productName} slipped into low-stock at ${item.stockQuantity} units.`,
              timestamp: new Date().toISOString(),
            });
          });
      } else {
        liveEvents.push({
          id: `sync-${Date.now()}`,
          title: "Live dashboard online",
          detail: "Realtime polling is active for orders, customers, stock levels, and product health.",
          timestamp: new Date().toISOString(),
        });
      }

      if (liveEvents.length) {
        setActivityFeed((current) => [...liveEvents, ...current].slice(0, 8));
      }

      previousSnapshot.current = {
        overview: overviewData,
        inventory: inventoryData,
        orders: orderData,
      };
    } catch (error) {
      handleAdminRequestError(error, "Could not load admin workspace.");
    } finally {
      if (!options?.silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadAdminData();

    const refreshTimer = window.setInterval(() => {
      void loadAdminData({ silent: true });
    }, REFRESH_INTERVAL_MS);

    const countdownTimer = window.setInterval(() => {
      setSecondsUntilRefresh((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);

    return () => {
      window.clearInterval(refreshTimer);
      window.clearInterval(countdownTimer);
    };
  }, []);

  const resetProductForm = () => {
    setEditingProductId(null);
    setProductForm(createEmptyFormState());
  };

  const selectedCategory = categories.find(
    (category) => String(category.id) === productForm.categoryId,
  );
  const availableSubcategories = selectedCategory?.subcategories || [];
  const productImages = parseImageList(productForm.images);

  const handleAdminRequestError = (error: unknown, fallback: string) => {
    if (error instanceof AxiosError && error.response?.status === 403) {
      toast.error("Your admin session has expired or no longer has access. Please log in again.");
      logout();
      navigate("/admin/login", {
        replace: true,
        state: { from: location, adminOnly: true },
      });
      return;
    }

    toast.error(extractErrorMessage(error, fallback));
  };

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

    if (!Object.keys(payload.specifications).length) {
      toast.error("Add at least one specification in Label: Value format.");
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

  const handleAdminLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingOrders = orders.filter((order) =>
    ["PENDING", "CONFIRMED", "PROCESSING"].includes(order.status),
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

  const renderDashboardView = () => (
    <>
      <section className="admin-hero store-card">
        <div>
          <span className="eyebrow">Command center</span>
          <h1>Realtime admin dashboard for catalog, orders, and inventory.</h1>
          <p>
            Track operational health, react to stock risks, and manage the storefront
            from a dedicated control surface that matches VoltMart’s shopper UI.
          </p>
        </div>
        <div className="admin-hero__meta">
          <div className="admin-live-pill">
            <span className="admin-live-pill__dot" />
            Live sync every 15s
          </div>
          <strong>{lastUpdatedAt ? formatDateTime(lastUpdatedAt) : "Syncing..."}</strong>
          <span>Next refresh in {secondsUntilRefresh}s</span>
        </div>
      </section>

      <div className="admin-kpi-grid">
        <article className="store-card admin-kpi-card">
          <span>Total sales</span>
          <strong>{formatCurrency(totalRevenue)}</strong>
          <p>{pendingOrders} open orders still need action.</p>
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
              <span className="eyebrow">Realtime feed</span>
              <h2>Activity since the last syncs</h2>
            </div>
          </div>
          <div className="admin-activity-feed">
            {activityFeed.map((activity) => (
              <div key={activity.id} className="admin-activity-feed__item">
                <strong>{activity.title}</strong>
                <p>{activity.detail}</p>
                <span>{formatDateTime(activity.timestamp)}</span>
              </div>
            ))}
          </div>
        </article>

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
    <div className="admin-workspace-grid">
      <section className="store-card admin-panel admin-form-panel">
        <div className="admin-panel__heading">
          <div>
            <span className="eyebrow">Catalog studio</span>
            <h2>{editingProductId ? "Edit product" : "Add a new product"}</h2>
          </div>
          {editingProductId ? (
            <button className="link-button" type="button" onClick={resetProductForm}>
              Reset form
            </button>
          ) : null}
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
              Slug
              <div className="admin-inline-field">
                <input
                  value={productForm.slug}
                  onChange={(event) => handleProductFormChange("slug", event.target.value)}
                  placeholder="voltmart-pro-dock"
                  required
                />
                <button
                  className="link-button"
                  type="button"
                  onClick={() => handleProductFormChange("slug", slugify(productForm.name))}
                >
                  Generate
                </button>
              </div>
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
            <label>
              Hero tag
              <input
                value={productForm.heroTag}
                onChange={(event) => handleProductFormChange("heroTag", event.target.value)}
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
              Specifications
              <textarea
                rows={5}
                value={productForm.specifications}
                onChange={(event) =>
                  handleProductFormChange("specifications", event.target.value)
                }
                placeholder="Processor: Intel Core i7"
                required
              />
            </label>
            <label className="form-grid__wide">
              Tags
              <textarea
                rows={3}
                value={productForm.tags}
                onChange={(event) => handleProductFormChange("tags", event.target.value)}
                placeholder="gaming, creator, wireless"
              />
            </label>
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
              {savingProduct
                ? "Saving..."
                : editingProductId
                  ? "Update product"
                  : "Add product"}
            </button>
            <button className="link-button" type="button" onClick={resetProductForm}>
              Clear
            </button>
          </div>
        </form>
      </section>

      <section className="admin-side-stack">
        <article className="store-card admin-panel">
          <div className="admin-panel__heading">
            <div>
              <span className="eyebrow">Inventory radar</span>
              <h2>Low stock alerts</h2>
            </div>
          </div>
          <div className="admin-alert-list">
            {lowStockItems.length ? (
              lowStockItems.map((item) => (
                <div key={item.inventoryId} className="admin-alert-item">
                  <strong>{item.productName}</strong>
                  <p>
                    {item.stockQuantity} units left, threshold {item.lowStockThreshold}
                  </p>
                </div>
              ))
            ) : (
              <div className="admin-empty-note">No low-stock alerts right now.</div>
            )}
          </div>
        </article>

        <article className="store-card admin-panel">
          <div className="admin-panel__heading">
            <div>
              <span className="eyebrow">Catalog value</span>
              <h2>Inventory snapshot</h2>
            </div>
          </div>
          <div className="admin-summary-stack">
            <div>
              <span>Total catalog value</span>
              <strong>{formatCurrency(catalogValue)}</strong>
            </div>
            <div>
              <span>Tracked products</span>
              <strong>{products.length}</strong>
            </div>
            <div>
              <span>Realtime stock units</span>
              <strong>{totalUnits}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="store-card admin-panel admin-panel--full">
        <div className="admin-panel__heading">
          <div>
            <span className="eyebrow">Product management</span>
            <h2>Manage catalog and inventory</h2>
          </div>
        </div>
        <div className="admin-table">
          <table>
            <thead>
              <tr>
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
              {products.map((product) => (
                <tr key={product.id}>
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
              {orders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr>
                    <td>
                      <button
                        className="admin-order-toggle"
                        type="button"
                        onClick={() =>
                          setExpandedOrderId((current) =>
                            current === order.id ? null : order.id,
                          )
                        }
                      >
                        <strong>{order.orderNumber.slice(0, 8)}</strong>
                        <span>
                          {expandedOrderId === order.id ? "Hide details" : "Show details"}
                        </span>
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
                        onChange={(event) =>
                          void handleStatusChange(order.id, event.target.value)
                        }
                      >
                        {ORDER_STATUS_OPTIONS.map((status) => (
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
                            <p>Subtotal: {formatCurrency(order.subtotal)}</p>
                            <p>Shipping: {formatCurrency(order.shippingCost)}</p>
                            <p>Tax: {formatCurrency(order.taxAmount)}</p>
                            <p>Total: {formatCurrency(order.totalAmount)}</p>
                          </section>
                          <section className="admin-order-details__section">
                            <span className="eyebrow">Delivery details</span>
                            <p>{order.shippingAddress}</p>
                            <p>
                              {order.city}, {order.postalCode}
                            </p>
                          </section>
                          <section className="admin-order-details__section admin-order-details__section--full">
                            <span className="eyebrow">Items</span>
                            <div className="admin-order-item-list">
                              {order.items.map((item) => (
                                <div
                                  key={`${order.id}-${item.productSlug}`}
                                  className="admin-order-item"
                                >
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
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-side-stack">
        <article className="store-card admin-panel">
          <div className="admin-panel__heading">
            <div>
              <span className="eyebrow">Customer ledger</span>
              <h2>Users and access</h2>
            </div>
          </div>
          <div className="admin-user-list">
            {users.slice(0, 6).map((user) => (
              <div key={user.id} className="admin-user-list__item">
                <div>
                  <strong>{user.fullName}</strong>
                  <span>{user.email}</span>
                </div>
                <span>{user.role.replace("ROLE_", "")}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="store-card admin-panel">
          <div className="admin-panel__heading">
            <div>
              <span className="eyebrow">Ops pulse</span>
              <h2>Fulfilment snapshot</h2>
            </div>
          </div>
          <div className="admin-summary-stack">
            <div>
              <span>Pending or processing</span>
              <strong>{pendingOrders}</strong>
            </div>
            <div>
              <span>Delivered orders</span>
              <strong>
                {orders.filter((order) => order.status === "DELIVERED").length}
              </strong>
            </div>
            <div>
              <span>Cancelled orders</span>
              <strong>
                {orders.filter((order) => order.status === "CANCELLED").length}
              </strong>
            </div>
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
          <p>
            Use dedicated admin URLs for live dashboards, product creation, inventory
            monitoring, and order management.
          </p>
        </div>
        <div className="admin-page-header__actions">
          <span>{user?.fullName || "Admin"}</span>
          <button className="link-button" type="button" onClick={handleAdminLogout}>
            Logout
          </button>
        </div>
      </div>

      <nav className="admin-nav">
        <NavLink to="/admin/dashboard">Dashboard</NavLink>
        <NavLink to="/admin/inventory">Inventory & products</NavLink>
        <NavLink to="/admin/orders">Orders & users</NavLink>
      </nav>

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
