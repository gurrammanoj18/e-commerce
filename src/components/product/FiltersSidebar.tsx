import React from "react";
import "../../styles/product/FiltersSidebar.css";
import {
  CategorySummary,
  ProductAvailabilityFilter,
  ProductSort,
} from "../../types/store";
import { formatCurrency } from "../../utils/currency";

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
  onReset: () => void;
  showCategoryFilter?: boolean;
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
  onReset,
  showCategoryFilter = true,
}) => {
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

  return (
    <aside className="store-card filters-sidebar">
      <div className="filters-sidebar__top">
        <h3>Refine results</h3>
        <button type="button" onClick={onReset}>
          Reset
        </button>
      </div>

      <div className="filters-group">
        <label htmlFor="sortBy">Sort by</label>
        <select
          id="sortBy"
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

      <div className="filters-group">
        <label htmlFor="brandFilter">Brand</label>
        <select
          id="brandFilter"
          value={selectedBrand}
          onChange={(event) => onBrandChange(event.target.value)}
        >
          <option value="All">All brands</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      {showCategoryFilter ? (
        <div className="filters-group">
          <span>Category</span>
          <div className="filter-chip-list">
            <button
              className={selectedCategory === "All" ? "is-active" : ""}
              type="button"
              onClick={() => onCategoryChange("All")}
            >
              All
            </button>
            {categoryOptions.map((category) => (
              <button
                key={category.key}
                className={selectedCategory === category.value ? "is-active" : ""}
                type="button"
                onClick={() => onCategoryChange(category.value)}
              >
                {category.isSubcategory ? `${category.label}` : category.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="filters-group">
        <label htmlFor="availabilityFilter">Availability</label>
        <select
          id="availabilityFilter"
          value={availabilityFilter}
          onChange={(event) =>
            onAvailabilityChange(event.target.value as ProductAvailabilityFilter)
          }
        >
          <option value="all">All stock states</option>
          <option value="in-stock">In stock</option>
          <option value="low-stock">Low stock</option>
          <option value="out-of-stock">Out of stock</option>
        </select>
      </div>

      <div className="filters-group">
        <span>Price range</span>
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

      <div className="filters-group">
        <span>Minimum discount</span>
        <div className="filter-chip-list">
          {[0, 10, 20, 30, 40].map((discount) => (
            <button
              key={discount}
              className={minimumDiscount === discount ? "is-active" : ""}
              type="button"
              onClick={() => onMinimumDiscountChange(discount)}
            >
              {discount === 0 ? "Any" : `${discount}%+`}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default FiltersSidebar;
