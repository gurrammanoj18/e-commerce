import { Product } from "../types/store";

const SECTION_TAG_MATCHERS: Record<string, string[]> = {
  "hard-to-find": ["hard-to-find-products"],
  "everyday-essentials": ["everyday-essentials"],
  "electrical-essentials": ["electrical-essentials"],
  "hardware-tools": ["hardware-tools"],
  "plumbing-bathroom": ["plumbing-bathroom"],
};

const normalize = (value: string) => value.trim().toLowerCase();

export const getHomepageSectionProducts = (products: Product[], sectionKey: string) => {
  const normalizedSectionKey = normalize(sectionKey);

  if (normalizedSectionKey === "recently-added") {
    return [...products].sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
  }

  if (normalizedSectionKey === "best-selling") {
    return [...products].sort((left, right) => {
      if (right.bestSeller !== left.bestSeller) {
        return Number(right.bestSeller) - Number(left.bestSeller);
      }

      if (right.featured !== left.featured) {
        return Number(right.featured) - Number(left.featured);
      }

      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });
  }

  const tagMatchers = SECTION_TAG_MATCHERS[normalizedSectionKey] || [];

  if (normalizedSectionKey === "plumbing-bathroom") {
    return products.filter((product) => {
      const productCategory = normalize(product.category);
      const productCategorySlug = normalize(product.categorySlug);
      const productSubcategory = normalize(product.subcategory);
      const productSubcategorySlug = normalize(product.subcategorySlug);

      return (
        tagMatchers.some((tag) => product.tags.some((productTag) => normalize(productTag) === tag)) ||
        ["plumbing", "bathroom"].includes(productCategory) ||
        ["plumbing", "bathroom"].includes(productCategorySlug) ||
        ["plumbing", "bathroom"].includes(productSubcategory) ||
        ["plumbing", "bathroom"].includes(productSubcategorySlug)
      );
    });
  }

  if (tagMatchers.length) {
    return products.filter((product) =>
      tagMatchers.some((tag) => product.tags.some((productTag) => normalize(productTag) === tag)),
    );
  }

  return products;
};

export const isHomepageSectionKey = (value: string) =>
  Object.prototype.hasOwnProperty.call(SECTION_TAG_MATCHERS, normalize(value)) ||
  ["recently-added", "best-selling"].includes(normalize(value));
