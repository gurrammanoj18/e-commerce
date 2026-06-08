import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import {
  addCartItem,
  fetchCart,
  removeCartItem,
  updateCartItem,
} from "../services/cartService";
import { CartApiItem, CartItem, Product } from "../types/store";
import { useAuth } from "./AuthContext";
import { useProcessing } from "./ProcessingContext";

interface CartContextValue {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  loading: boolean;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const CART_STORAGE_KEY = "voltmart-cart-local";

const getCartErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const responseMessage = error.response?.data?.message;
    if (typeof responseMessage === "string" && responseMessage.trim()) {
      return responseMessage;
    }
  }

  return fallback;
};

const isAuthorizationError = (error: unknown) =>
  error instanceof AxiosError &&
  (error.response?.status === 401 || error.response?.status === 403);

const toCartItem = (item: CartApiItem): CartItem => ({
  id: item.id,
  quantity: item.quantity,
  product: {
    id: item.productId,
    slug: item.productSlug,
    name: item.productName,
    brand: "",
    category: "",
    categorySlug: "",
    subcategory: "",
    subcategorySlug: "",
    subcategoryId: 0,
    price: item.unitPrice,
    originalPrice: item.unitPrice,
    discountPercentage: 0,
    rating: 0,
    reviewCount: 0,
    stockQuantity: item.stockQuantity,
    lowStock: false,
    availability:
      item.stockQuantity <= 0
        ? "out-of-stock"
        : item.stockQuantity <= 5
        ? "low-stock"
        : "in-stock",
    badge: "",
    shortDescription: "",
    description: "",
    heroTag: "",
    images: item.image ? [item.image] : [],
    tags: [],
    featured: false,
    bestSeller: false,
    bulkEligible: false,
    newArrival: false,
    warrantyAvailable: false,
    replacementAvailable: item.stockQuantity > 0,
  },
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { startProcessing, stopProcessing } = useProcessing();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const useRemoteCart = isAuthenticated && user?.role === "ROLE_CUSTOMER";

  const loadRemoteCart = useCallback(async () => {
    if (!useRemoteCart) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const cart = await fetchCart();
      setItems(cart.items.map(toCartItem));
    } catch (error) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [useRemoteCart]);

  useEffect(() => {
    if (useRemoteCart) {
      void loadRemoteCart();
      return;
    }

    const storedItems = window.localStorage.getItem(CART_STORAGE_KEY);
    if (storedItems) {
      setItems(JSON.parse(storedItems));
    } else {
      setItems([]);
    }
  }, [loadRemoteCart, useRemoteCart]);

  useEffect(() => {
    if (!useRemoteCart) {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, useRemoteCart]);

  const addToCart = async (product: Product, quantity = 1) => {
    const previousItems = items;

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.product.id === product.id);
      if (existingItem) {
        return currentItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...currentItems, { product, quantity }];
    });

    if (useRemoteCart) {
      try {
        const cart = await addCartItem(product.id, quantity);
        setItems(cart.items.map(toCartItem));
      } catch (error) {
        setItems(previousItems);
        if (isAuthorizationError(error)) {
          setItems([]);
          return;
        }

        toast.error(getCartErrorMessage(error, "Couldn't add this item to cart right now."));
      }
      return;
    }
  };

  const removeFromCart = async (productId: number) => {
    if (useRemoteCart) {
      const item = items.find((cartItem) => cartItem.product.id === productId);
      if (item?.id) {
        const previousItems = items;
        setItems((currentItems) =>
          currentItems.filter((cartItem) => cartItem.product.id !== productId)
        );
        const processingId = startProcessing({
          title: "Updating cart",
          message: "Removing this item from your cart...",
        });
        try {
          await removeCartItem(item.id);
        } catch (error) {
          setItems(previousItems);
          if (isAuthorizationError(error)) {
            setItems([]);
            return;
          }

          toast.error(getCartErrorMessage(error, "Couldn't remove this item from cart right now."));
          return;
        } finally {
          stopProcessing(processingId);
        }

        await loadRemoteCart();
      }
      return;
    }

    setItems((currentItems) =>
      currentItems.filter((item) => item.product.id !== productId)
    );
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    if (useRemoteCart) {
      const item = items.find((cartItem) => cartItem.product.id === productId);
      if (item?.id) {
        const processingId = startProcessing({
          title: "Updating quantity",
          message: "Refreshing your cart totals...",
        });
        try {
          await updateCartItem(item.id, productId, quantity);
          await loadRemoteCart();
        } catch (error) {
          if (isAuthorizationError(error)) {
            setItems([]);
            return;
          }

          toast.error(getCartErrorMessage(error, "Couldn't update cart quantity right now."));
        } finally {
          stopProcessing(processingId);
        }
      }
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    window.localStorage.removeItem(CART_STORAGE_KEY);
  };

  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.product.price * item.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
