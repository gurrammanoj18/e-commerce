import React, { useEffect, useMemo, useState } from "react";
import "../../styles/product/FiltersSidebar.css";
import {
  CategorySummary,
  ProductAvailabilityFilter,
  ProductSort,
} from "../../types/store";
import { formatCurrency } from "../../utils/currency";

const availabilityOptions = [
  { label: "All stock states", value: "all" as ProductAvailabilityFilter },
  { label: "In stock", value: "in-stock" as ProductAvailabilityFilter },
  { label: "Low stock", value: "low-stock" as ProductAvailabilityFilter },
  { label: "Out of stock", value: "out-of-stock" as ProductAvailabilityFilter },
];

const discountOptions = [0, 10, 20, 30, 40];

interface FiltersSidebarProps {
  brands: string[];
  selectedBrand: string;
  onBrandChange: (value: string) => void;
  categories: CategorySummary[];
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  availabilityFilter: ProductAvailabilityFilter;
  onAvailabilityChange: (value: ProductAvailabilityFilter) => void;
  minimumDiscount: number;
  onMinimumDiscountChange: (value: number) => void;
  sortBy: ProductSort;
  onSortChange: (value: ProductSort) => void;
  priceRange: { min: number; max: number };
  maxCatalogPrice: number;
  onPriceRangeChange: (value: { min: number; max: number }) => void;
  onClose: () => void;
  onReset: () => void;
  onApply: () => void;
  showCategoryFilter?: boolean;
  initialSection?: "category" | "brand" | "price" | "availability" | "sort" | "discount";
}

const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
  brands,
  selectedBrand,
  onBrandChange,
  categories,
  selectedCategory,
  onCategoryChange,
  availabilityFilter,
  onAvailabilityChange,
  minimumDiscount,
  onMinimumDiscountChange,
  sortBy,
  onSortChange,
  priceRange,
  maxCatalogPrice,
  onPriceRangeChange,
  onClose,
  onReset,
  onApply,
  showCategoryFilter = true,
  initialSection = "category",
}) => {
  const [activeSection, setActiveSection] = useState<
    "category" | "brand" | "price" | "availability" | "sort" | "discount"
  >(
    initialSection
  );

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  const categoryOptions = categories.flatMap((category) => [
    {
      key: category.slug || category.name,
      label: category.name,
      value: category.slug || category.name,
      isSubcategory: false,
    },
    ...(category.subcategories || []).map((subcategory) => ({
      key: subcategory.slug || subcategory.name,
      label: subcategory.name,
      value: subcategory.slug || subcategory.name,
      isSubcategory: true,
    })),
  ]);

  const renderChoiceList = (
    heading: string,
    options: Array<{ key: string; label: string; value: string; count?: number }>,
    selectedValue: string,
    onSelect: (value: string) => void,
  ) => (
    <div className="filters-sidebar__panel">
      <h4>{heading}</h4>
      <div className="filters-sidebar__choice-list" role="list">
        {options.map((option) => {
          const isActive = selectedValue === option.value;
          return (
            <button
              key={option.key}
              className={`filters-sidebar__choice-row ${isActive ? "is-active" : ""}`}
              type="button"
              onClick={() => onSelect(option.value)}
            >
              <span className="filters-sidebar__choice-label">{option.label}</span>
              <span className="filters-sidebar__choice-meta">
                {typeof option.count === "number" ? (
                  <span className="filters-sidebar__choice-count">({option.count})</span>
                ) : null}
                <span className="filters-sidebar__choice-box" aria-hidden="true" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const currentOptions = useMemo(() => {
    if (activeSection === "brand") {
      return renderChoiceList(
        "Brand",
        [
          { key: "all-brands", label: "All brands", value: "All" },
          ...brands.map((brand) => ({ key: brand, label: brand, value: brand })),
        ],
        selectedBrand,
        onBrandChange,
      );
    }

    if (activeSection === "price") {
      return (
        <div className="filters-sidebar__panel">
          <h4>Price Range</h4>
          <input
            type="range"
            min={0}
            max={maxCatalogPrice || 250000}
            value={priceRange.max}
            onChange={(event) =>
              onPriceRangeChange({
                ...priceRange,
                max: Number(event.target.value),
              })
            }
          />
          <div className="filters-price-row">
            <label>
              Min
              <input
                type="number"
                min={0}
                value={priceRange.min}
                onChange={(event) =>
                  onPriceRangeChange({
                    ...priceRange,
                    min: Number(event.target.value),
                  })
                }
              />
            </label>
            <label>
              Max
              <input
                type="number"
                min={priceRange.min}
                value={priceRange.max}
                onChange={(event) =>
                  onPriceRangeChange({
                    ...priceRange,
                    max: Number(event.target.value),
                  })
                }
              />
            </label>
          </div>
          <p className="filters-caption">
            Showing items up to {formatCurrency(priceRange.max)}
          </p>
        </div>
      );
    }

    if (activeSection === "availability") {
      return renderChoiceList(
        "Colour",
        availabilityOptions.map((option) => ({
          key: option.value,
          label: option.label,
          value: option.value,
        })),
        availabilityFilter,
        (value) => onAvailabilityChange(value as ProductAvailabilityFilter),
      );
    }

    if (activeSection === "discount") {
      return renderChoiceList(
        "Minimum Discount",
        discountOptions.map((discount) => ({
          key: `${discount}`,
          label: discount === 0 ? "Any" : `${discount}%+`,
          value: `${discount}`,
        })),
        `${minimumDiscount}`,
        (value) => onMinimumDiscountChange(Number(value)),
      );
    }

    if (activeSection === "sort") {
      return (
        <div className="filters-sidebar__panel">
          <h4>Sort by</h4>
          <select
            className="filters-sidebar__select"
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value as ProductSort)}
          >
            <option value="featured">Featured</option>
            <option value="rating">Top rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="discount-high">Highest discount</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
            <option value="newest">New arrivals</option>
          </select>
        </div>
      );
    }

    return renderChoiceList(
      "Category",
      [
        { key: "all-categories", label: "All", value: "All" },
        ...categoryOptions.map((category) => ({
          key: category.key,
          label: category.label,
          value: category.value,
        })),
      ],
      selectedCategory,
      onCategoryChange,
    );
  }, [
    activeSection,
    availabilityFilter,
    brands,
    categoryOptions,
    minimumDiscount,
    maxCatalogPrice,
    onAvailabilityChange,
    onBrandChange,
    onCategoryChange,
    onMinimumDiscountChange,
    onPriceRangeChange,
    onSortChange,
    priceRange,
    selectedBrand,
    selectedCategory,
    sortBy,
  ]);

  return (
    <aside className="store-card filters-sidebar filters-sidebar--drawer">
      <div className="filters-sidebar__top">
        <h3>FILTERS</h3>
        <button type="button" className="filters-sidebar__close" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="filters-sidebar__body">
        <div className="filters-sidebar__nav">
          {[
            { key: "category", label: "Category" },
            { key: "brand", label: "Brand" },
            { key: "price", label: "Price Range" },
            { key: "availability", label: "Colour" },
            { key: "sort", label: "Sort by" },
            { key: "discount", label: "Minimum Discount" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              className={activeSection === item.key ? "is-active" : ""}
              onClick={() => setActiveSection(item.key as typeof activeSection)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="filters-sidebar__content">
          {currentOptions}
        </div>
      </div>

      <div className="filters-sidebar__actions">
        <button type="button" className="link-button" onClick={onReset}>
          Clean
        </button>
        <button type="button" className="button" onClick={onApply}>
          Apply
        </button>
      </div>
    </aside>
  );
};

export default FiltersSidebar;
