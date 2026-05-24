import React from "react";
import { CategorySummary, ProductSort } from "../../types/store";
import { formatCurrency } from "../../utils/currency";

interface FiltersSidebarProps {
  categories: CategorySummary[];
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  sortBy: ProductSort;
  onSortChange: (value: ProductSort) => void;
  priceRange: { min: number; max: number };
  maxCatalogPrice: number;
  onPriceRangeChange: (value: { min: number; max: number }) => void;
  onReset: () => void;
  showCategoryFilter?: boolean;
}

const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  priceRange,
  maxCatalogPrice,
  onPriceRangeChange,
  onReset,
  showCategoryFilter = true,
}) => {
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
          <option value="newest">New arrivals</option>
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
            {categories.map((category) => (
              <button
                key={category.name}
                className={selectedCategory === category.name ? "is-active" : ""}
                type="button"
                onClick={() => onCategoryChange(category.name)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

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
    </aside>
  );
};

export default FiltersSidebar;
