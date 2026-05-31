import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import { Product } from "../types/store";
import { useAuth } from "./AuthContext";
import { useProcessing } from "./ProcessingContext";
import {
  addWishlistItem,
  fetchWishlist,
  removeWishlistItem,
} from "../services/wishlistService";
import { transformProduct } from "../services/productService";

interface WishlistEntry {
  id?: number;
  product: Product;
  addedAt?: string;
}

interface WishlistContextValue {
  items: WishlistEntry[];
  itemCount: number;
  loading: boolean;
  isInWishlist: (productId: number) => boolean;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  toggleWishlist: (product: Product) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);
const WISHLIST_STORAGE_KEY = "voltmart-wishlist-local";

const isAuthorizationError = (error: unknown) =>
  error instanceof AxiosError &&
  (error.response?.status === 401 || error.response?.status === 403);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { startProcessing, stopProcessing } = useProcessing();
  const [items, setItems] = useState<WishlistEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const useRemoteWishlist = isAuthenticated && user?.role === "ROLE_CUSTOMER";

  const loadRemoteWishlist = useCallback(async () => {
    if (!useRemoteWishlist) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const wishlist = await fetchWishlist();
      const itemByProductId = new Map(wishlist.items.map((item) => [item.productId, item]));
      setItems(
        wishlist.products.map((product) => ({
          id: itemByProductId.get(product.id)?.id,
          addedAt: itemByProductId.get(product.id)?.addedAt,
          product: transformProduct(product),
        })),
      );
    } catch (error) {
      if (isAuthorizationError(error)) {
        setItems([]);
        logout();
        return;
      }

      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [logout, useRemoteWishlist]);

  useEffect(() => {
    if (useRemoteWishlist) {
      void loadRemoteWishlist();
      return;
    }

    const storedItems = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (storedItems) {
      setItems(JSON.parse(storedItems));
    } else {
      setItems([]);
    }
  }, [loadRemoteWishlist, useRemoteWishlist]);

  useEffect(() => {
    if (!useRemoteWishlist) {
      window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, useRemoteWishlist]);

  const isInWishlist = (productId: number) =>
    items.some((item) => item.product.id === productId);

  const addToWishlist = async (product: Product) => {
    if (useRemoteWishlist) {
      try {
        await addWishlistItem(product.id);
        await loadRemoteWishlist();
      } catch (error) {
        if (isAuthorizationError(error)) {
          setItems([]);
          logout();
          return;
        }

        toast.error("Couldn't add this item to wishlist right now.");
      }
      return;
    }

    setItems((currentItems) =>
      currentItems.some((item) => item.product.id === product.id)
        ? currentItems
        : [...currentItems, { product, addedAt: new Date().toISOString() }],
    );
  };

  const removeFromWishlist = async (productId: number) => {
    if (useRemoteWishlist) {
      const item = items.find((wishlistItem) => wishlistItem.product.id === productId);
      if (item?.id) {
        const previousItems = items;
        setItems((currentItems) =>
          currentItems.filter((wishlistItem) => wishlistItem.product.id !== productId),
        );
        const processingId = startProcessing({
          title: "Updating wishlist",
          message: "Removing this product from your saved items...",
        });
        try {
          await removeWishlistItem(item.id);
        } catch (error) {
          setItems(previousItems);
          if (isAuthorizationError(error)) {
            setItems([]);
            logout();
            return;
          }

          toast.error("Couldn't remove this item from wishlist right now.");
          return;
        } finally {
          stopProcessing(processingId);
        }

        await loadRemoteWishlist();
      }
      return;
    }

    setItems((currentItems) =>
      currentItems.filter((item) => item.product.id !== productId),
    );
  };

  const toggleWishlist = async (product: Product) => {
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
      return;
    }

    await addToWishlist(product);
  };

  const itemCount = useMemo(() => items.length, [items]);

  return (
    <WishlistContext.Provider
      value={{
        items,
        itemCount,
        loading,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
};
