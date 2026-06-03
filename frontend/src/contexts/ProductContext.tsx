import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  getBestSellerProducts,
  getCategories,
  getFeaturedProducts,
  getProductBySlug,
  getProducts,
  isPromotionalCategory,
} from "../services/productService";
import {
  CategorySummary,
  Product,
  ProductAvailabilityFilter,
  ProductSort,
} from "../types/store";

interface ProductContextValue {
  products: Product[];
  featuredProducts: Product[];
  bestSellerProducts: Product[];
  loading: boolean;
  error: string;
  searchTerm: string;
  availableBrands: string[];
  selectedBrand: string;
  selectedCategory: string;
  selectedPromoTag: string;
  availabilityFilter: ProductAvailabilityFilter;
  minimumDiscount: number;
  priceRange: { min: number; max: number };
  sortBy: ProductSort;
  currentPage: number;
  productsPerPage: number;
  categories: CategorySummary[];
  filteredProducts: Product[];
  paginatedProducts: Product[];
  totalPages: number;
  maxCatalogPrice: number;
  setSearchTerm: (value: string) => void;
  setSelectedBrand: (value: string) => void;
  setSelectedCategory: (value: string) => void;
  setSelectedPromoTag: (value: string) => void;
  setAvailabilityFilter: (value: ProductAvailabilityFilter) => void;
  setMinimumDiscount: (value: number) => void;
  setPriceRange: (value: { min: number; max: number }) => void;
  setSortBy: (value: ProductSort) => void;
  setCurrentPage: (value: number) => void;
  resetFilters: () => void;
  refreshCatalog: () => Promise<void>;
  getProductBySlug: (slug: string) => Promise<Product | undefined>;
  getRelatedProducts: (product: Product) => Product[];
}

const ProductContext = createContext<ProductContextValue | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellerProducts, setBestSellerProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTermState] = useState("");
  const [selectedBrand, setSelectedBrandState] = useState("All");
  const [selectedCategory, setSelectedCategoryState] = useState("All");
  const [selectedPromoTag, setSelectedPromoTagState] = useState("All");
  const [availabilityFilter, setAvailabilityFilterState] =
    useState<ProductAvailabilityFilter>("all");
  const [minimumDiscount, setMinimumDiscountState] = useState(0);
  const [sortBy, setSortByState] = useState<ProductSort>("featured");
  const [currentPage, setCurrentPageState] = useState(1);
  const [priceRange, setPriceRangeState] = useState({ min: 0, max: 250000 });
  const productsPerPage = 8;

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [pagedProducts, featured, bestSellers, categoryList] = await Promise.all([
        getProducts({ size: 100 }),
        getFeaturedProducts(),
        getBestSellerProducts(),
        getCategories(),
      ]);
      setProducts(pagedProducts.content);
      setFeaturedProducts(featured);
      setBestSellerProducts(bestSellers);
      setCategories(
        categoryList.filter((category) => !category.showInNavbar && !isPromotionalCategory(category))
      );
      const highestPrice = pagedProducts.content.reduce(
        (maxPrice, product) => Math.max(maxPrice, product.price),
        0
      );
      setPriceRangeState((current) => ({
        min: current.min,
        max: highestPrice || 250000,
      }));
    } catch {
      setError("Unable to load products right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    const handleCatalogRefresh = () => {
      void loadCatalog();
    };

    window.addEventListener("catalog:categories-updated", handleCatalogRefresh);
    return () => window.removeEventListener("catalog:categories-updated", handleCatalogRefresh);
  }, [loadCatalog]);

  const maxCatalogPrice = useMemo(
    () => products.reduce((maxPrice, product) => Math.max(maxPrice, product.price), 0),
    [products]
  );

  const availableBrands = useMemo(
    () => [...new Set(products.map((product) => product.brand))].sort((left, right) => left.localeCompare(right)),
    [products]
  );

  const filteredProducts = useMemo(
    () =>
      products
        .filter((product) => {
          const query = searchTerm.trim().toLowerCase();
          const matchesSearch =
            !query ||
            product.name.toLowerCase().includes(query) ||
            product.brand.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query) ||
            product.subcategory.toLowerCase().includes(query) ||
            product.tags.some((tag) => tag.toLowerCase().includes(query));

          const matchesCategory =
            selectedCategory === "All" ||
            product.category === selectedCategory ||
            product.categorySlug === selectedCategory ||
            product.subcategory === selectedCategory ||
            product.subcategorySlug === selectedCategory;

          const matchesBrand =
            selectedBrand === "All" || product.brand === selectedBrand;

          const matchesPromo =
            selectedPromoTag === "All" ||
            product.tags.some((tag) => tag.toLowerCase() === selectedPromoTag.toLowerCase());

          const matchesPrice =
            product.price >= priceRange.min && product.price <= priceRange.max;

          const matchesAvailability =
            availabilityFilter === "all" || product.availability === availabilityFilter;

          const matchesDiscount =
            minimumDiscount <= 0 || product.discountPercentage >= minimumDiscount;

          return (
            matchesSearch &&
            matchesCategory &&
            matchesBrand &&
            matchesPromo &&
            matchesPrice &&
            matchesAvailability &&
            matchesDiscount
          );
        })
        .sort((left, right) => {
          if (sortBy === "price-low") return left.price - right.price;
          if (sortBy === "price-high") return right.price - left.price;
          if (sortBy === "rating") return right.rating - left.rating;
          if (sortBy === "newest") return Number(right.newArrival) - Number(left.newArrival);
          if (sortBy === "discount-high") {
            return right.discountPercentage - left.discountPercentage;
          }
          if (sortBy === "name-asc") return left.name.localeCompare(right.name);
          if (sortBy === "name-desc") return right.name.localeCompare(left.name);
          return Number(right.featured) - Number(left.featured);
        }),
    [
      availabilityFilter,
      minimumDiscount,
      priceRange.max,
      priceRange.min,
      products,
      searchTerm,
      selectedBrand,
      selectedCategory,
      selectedPromoTag,
      sortBy,
    ]
  );

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (safePage - 1) * productsPerPage,
    safePage * productsPerPage
  );

  const setSearchTerm = (value: string) => {
    setSearchTermState(value);
    setCurrentPageState(1);
  };

  const setSelectedCategory = (value: string) => {
    setSelectedCategoryState(value);
    setCurrentPageState(1);
  };

  const setSelectedBrand = (value: string) => {
    setSelectedBrandState(value);
    setCurrentPageState(1);
  };

  const setSelectedPromoTag = (value: string) => {
    setSelectedPromoTagState(value);
    setCurrentPageState(1);
  };

  const setAvailabilityFilter = (value: ProductAvailabilityFilter) => {
    setAvailabilityFilterState(value);
    setCurrentPageState(1);
  };

  const setMinimumDiscount = (value: number) => {
    setMinimumDiscountState(value);
    setCurrentPageState(1);
  };

  const setPriceRange = (value: { min: number; max: number }) => {
    setPriceRangeState(value);
    setCurrentPageState(1);
  };

  const setSortBy = (value: ProductSort) => {
    setSortByState(value);
    setCurrentPageState(1);
  };

  const setCurrentPage = (value: number) => setCurrentPageState(value);

  const resetFilters = () => {
    setSearchTermState("");
    setSelectedBrandState("All");
    setSelectedCategoryState("All");
    setSelectedPromoTagState("All");
    setAvailabilityFilterState("all");
    setMinimumDiscountState(0);
    setSortByState("featured");
    setCurrentPageState(1);
    setPriceRangeState({ min: 0, max: maxCatalogPrice || 250000 });
  };

  const resolveProductBySlug = async (slug: string) => {
    const existingProduct = products.find((product) => product.slug === slug);
    if (existingProduct) {
      return existingProduct;
    }
    try {
      return await getProductBySlug(slug);
    } catch {
      return undefined;
    }
  };

  const getRelatedProducts = (product: Product) =>
    products
      .filter(
        (candidate) =>
          candidate.subcategory === product.subcategory && candidate.id !== product.id
      )
      .slice(0, 4);

  return (
    <ProductContext.Provider
      value={{
        products,
        featuredProducts,
        bestSellerProducts,
        loading,
        error,
        searchTerm,
        availableBrands,
        selectedBrand,
        selectedCategory,
        selectedPromoTag,
        availabilityFilter,
        minimumDiscount,
        priceRange,
        sortBy,
        currentPage: safePage,
        productsPerPage,
        categories,
        filteredProducts,
        paginatedProducts,
        totalPages,
        maxCatalogPrice,
        setSearchTerm,
        setSelectedBrand,
        setSelectedCategory,
        setSelectedPromoTag,
        setAvailabilityFilter,
        setMinimumDiscount,
        setPriceRange,
        setSortBy,
        setCurrentPage,
        resetFilters,
        refreshCatalog: loadCatalog,
        getProductBySlug: resolveProductBySlug,
        getRelatedProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within ProductProvider");
  }
  return context;
};
