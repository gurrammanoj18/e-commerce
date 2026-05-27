import api from "./api";
import { CategorySummary, PagedResponse, Product, ProductApiShape } from "../types/store";

export const transformProduct = (product: ProductApiShape): Product => {
  const stockQuantity = product.stockQuantity ?? product.stock ?? 0;
  const discountPercentage =
    product.discountPercentage ??
    (product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0);
  const lowStock = typeof product.lowStock === "boolean" ? product.lowStock : stockQuantity > 0 && stockQuantity <= 5;
  const availability =
    stockQuantity <= 0 ? "out-of-stock" : lowStock ? "low-stock" : "in-stock";

  return {
    ...product,
    stockQuantity,
    lowStock,
    availability,
    discountPercentage,
    warrantyAvailable: product.warrantyAvailable,
    replacementAvailable: product.replacementAvailable,
    images: product.images || [],
  };
};

export const getProducts = async (params?: {
  category?: string;
  search?: string;
  sort?: string;
  page?: number;
  size?: number;
}): Promise<PagedResponse<Product>> => {
  const response = await api.get<ProductApiShape[]>("/products/catalog");
  const products = response.data.map(transformProduct);
  const query = params?.search?.trim().toLowerCase();
  const category = params?.category?.trim().toLowerCase();

  const filtered = products.filter((product) => {
    const matchesSearch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.brand.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.subcategory.toLowerCase().includes(query) ||
      product.tags.some((tag) => tag.toLowerCase().includes(query));

    const matchesCategory =
      !category ||
      product.categorySlug.toLowerCase() === category ||
      product.category.toLowerCase() === category ||
      product.subcategorySlug.toLowerCase() === category ||
      product.subcategory.toLowerCase() === category;

    return matchesSearch && matchesCategory;
  });

  const sorted = [...filtered].sort((left, right) => {
    if (params?.sort === "price-low") return left.price - right.price;
    if (params?.sort === "price-high") return right.price - left.price;
    if (params?.sort === "rating") return right.rating - left.rating;
    if (params?.sort === "newest") return Number(right.newArrival) - Number(left.newArrival);
    return Number(right.featured) - Number(left.featured);
  });

  const page = params?.page ?? 0;
  const size = params?.size ?? sorted.length;
  const pagedContent = sorted.slice(page * size, page * size + size);

  return {
    content: pagedContent,
    page,
    size,
    totalElements: sorted.length,
    totalPages: Math.max(1, Math.ceil(sorted.length / size)),
  };
};

export const getProductBySlug = async (slug: string): Promise<Product> => {
  const response = await api.get(`/products/${slug}`);
  return transformProduct(response.data);
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  const response = await api.get<any[]>("/products/featured");
  return response.data.map(transformProduct);
};

export const getBestSellerProducts = async (): Promise<Product[]> => {
  const response = await api.get<any[]>("/products/best-sellers");
  return response.data.map(transformProduct);
};

export const getCategories = async (): Promise<CategorySummary[]> => {
  const response = await api.get<any[]>("/categories");
  const mapCategory = (category: any): CategorySummary => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    count: category.productCount,
    description: category.description,
    icon: category.icon,
    image: category.image,
    parentId: category.parentId,
    isLeaf: category.leaf,
    subcategories: (category.subcategories || []).map(mapCategory),
  });

  return response.data.map(mapCategory);
};
