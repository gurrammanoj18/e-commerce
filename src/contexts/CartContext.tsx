import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  addCartItem,
  fetchCart,
  removeCartItem,
  updateCartItem,
} from "../services/cartService";
import { CartItem, Product } from "../types/store";
import { useAuth } from "./AuthContext";

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

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRemoteCart = async () => {
    setLoading(true);
    try {
      const cart = await fetchCart();
      setItems(
        cart.items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          product: {
            id: item.productId,
            slug: item.productSlug,
            name: item.productName,
            brand: "",
            category: "",
            categorySlug: "",
            price: item.unitPrice,
            originalPrice: item.unitPrice,
            rating: 0,
            reviewCount: 0,
            stockQuantity: item.stockQuantity,
            lowStock: false,
            badge: "",
            shortDescription: "",
            description: "",
            heroTag: "",
            images: item.image ? [item.image] : [],
            specs: [],
            tags: [],
            featured: false,
            bestSeller: false,
            bulkEligible: false,
            newArrival: false,
          },
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      void loadRemoteCart();
      return;
    }

    const storedItems = window.localStorage.getItem(CART_STORAGE_KEY);
    if (storedItems) {
      setItems(JSON.parse(storedItems));
    } else {
      setItems([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [isAuthenticated, items]);

  const addToCart = async (product: Product, quantity = 1) => {
    if (isAuthenticated) {
      await addCartItem(product.id, quantity);
      await loadRemoteCart();
      return;
    }

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
  };

  const removeFromCart = async (productId: number) => {
    if (isAuthenticated) {
      const item = items.find((cartItem) => cartItem.product.id === productId);
      if (item?.id) {
        await removeCartItem(item.id);
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

    if (isAuthenticated) {
      const item = items.find((cartItem) => cartItem.product.id === productId);
      if (item?.id) {
        await updateCartItem(item.id, productId, quantity);
        await loadRemoteCart();
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
