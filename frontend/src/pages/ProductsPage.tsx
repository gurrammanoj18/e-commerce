import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import "../styles/pages/ProductsPage.css";
import FiltersSidebar from "../components/product/FiltersSidebar";
import ProductCard from "../components/product/ProductCard";
import LoadingState from "../components/shared/LoadingState";
import Pagination from "../components/shared/Pagination";
import { useProducts } from "../contexts/ProductContext";
import { ProductAvailabilityFilter, ProductSort } from "../types/store";
import { getHomepageSectionProducts } from "../utils/homepageSections";

type FilterSection = "category" | "brand" | "price" | "availability" | "discount";

const toDisplayLabel = (value: string) =>
  value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const ProductsPage: React.FC = () => {
  const {
    availableBrands,
    bestSellerProducts,
    categories,
    currentPage,
    filteredProducts,
    loading,
    maxCatalogPrice,
    paginatedProducts,
    resetFilters,
    setAvailabilityFilter,
    setCurrentPage,
    setMinimumDiscount,
    setPriceRange,
    setSelectedBrand,
    setSelectedCategory,
    setSelectedPromoTag,
    setSearchTerm,
    setSortBy,
    totalPages,
  } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const appliedQuerySignature = useRef("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilterSection, setActiveFilterSection] = useState<FilterSection>("category");
  const [draftFilters, setDraftFilters] = useState({
    category: "All",
    brand: "All",
    availability: "all" as ProductAvailabilityFilter,
    minimumDiscount: 0,
    sortBy: "featured" as ProductSort,
    priceRange: { min: 0, max: 250000 },
  });
  const hasProductDiscoveryParams =
    searchParams.get("discover") === "1" ||
    Boolean(searchParams.get("search")) ||
    Boolean(searchParams.get("category")) ||
    Boolean(searchParams.get("brand")) ||
    Boolean(searchParams.get("promo")) ||
    Boolean(searchParams.get("section")) ||
    Boolean(searchParams.get("view"));

  const isDiscoverMode = useMemo(() => hasProductDiscoveryParams, [hasProductDiscoveryParams]);
  const isCollectionMode =
    searchParams.get("view") === "collection" ||
    Boolean(searchParams.get("promo")) ||
    Boolean(searchParams.get("section"));
  const collectionSectionKey = searchParams.get("section") ?? "";
  const collectionTitle = useMemo(() => {
    const title =
      searchParams.get("title") ||
      collectionSectionKey ||
      searchParams.get("category") ||
      searchParams.get("promo") ||
      searchParams.get("search") ||
      "Products";

    return `Buy ${toDisplayLabel(title)} Online`;
  }, [collectionSectionKey, searchParams]);

  const collectionFilterChips = useMemo(
    () =>
      categories
        .flatMap((category) =>
          category.subcategories?.length ? category.subcategories : [category]
        )
        .filter((category) => category.slug || category.name)
        .slice(0, 5),
    [categories]
  );

  useEffect(() => {
    const nextSearch = searchParams.get("search") ?? "";
    const nextCategory = searchParams.get("category") ?? "All";
    const nextBrand = searchParams.get("brand") ?? "All";
    const nextPromo = searchParams.get("promo") ?? "All";
    const nextSection = searchParams.get("section") ?? "";
    const nextSort = (searchParams.get("sort") ?? "featured") as ProductSort;
    const signature = `${isDiscoverMode}|${nextSearch}|${nextCategory}|${nextBrand}|${nextPromo}|${nextSection}|${nextSort}`;

    if (appliedQuerySignature.current === signature) {
      return;
    }

    if (isDiscoverMode) {
      setSearchTerm(nextSearch);
      setSelectedCategory(nextCategory);
      setSelectedBrand(nextBrand);
      setSelectedPromoTag(nextPromo);
      setSortBy(nextSort);
      setDraftFilters((current) => ({
        ...current,
        category: nextCategory,
        brand: nextBrand,
        sortBy: nextSort,
      }));
    } else {
      resetFilters();
    }

    appliedQuerySignature.current = signature;
  }, [
    isDiscoverMode,
    resetFilters,
    searchParams,
    setSearchTerm,
    setSelectedBrand,
    setSelectedCategory,
    setSelectedPromoTag,
    setSortBy,
  ]);

  useEffect(() => {
    if (!isFilterOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    };
  }, [isFilterOpen]);

  const updateDiscoverParams = (updates: Record<string, string | null>) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("discover", "1");

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "All") {
        nextParams.delete(key);
        return;
      }
      nextParams.set(key, value);
    });

    setSearchParams(nextParams);
  };

  const collectionProducts = useMemo(
    () => {
      if (collectionSectionKey === "best-selling") {
        return bestSellerProducts;
      }

      return collectionSectionKey
        ? getHomepageSectionProducts(filteredProducts, collectionSectionKey)
        : filteredProducts;
    },
    [bestSellerProducts, collectionSectionKey, filteredProducts],
  );

  const openFilters = (section: FilterSection = "category") => {
    setActiveFilterSection(section);
    setIsFilterOpen(true);
  };

  const applyDraftFilters = () => {
    setSelectedCategory(draftFilters.category);
    setSelectedBrand(draftFilters.brand);
    setAvailabilityFilter(draftFilters.availability);
    setMinimumDiscount(draftFilters.minimumDiscount);
    setSortBy(draftFilters.sortBy);
    setPriceRange(draftFilters.priceRange);
    setIsFilterOpen(false);
  };

  const resetCurrentFilters = () => {
    setDraftFilters({
      category: "All",
      brand: "All",
      availability: "all" as ProductAvailabilityFilter,
      minimumDiscount: 0,
      sortBy: "featured" as ProductSort,
      priceRange: { min: 0, max: maxCatalogPrice || 250000 },
    });
    resetFilters();

    if (!isCollectionMode) {
      setSearchParams(new URLSearchParams({ discover: "1" }));
      return;
    }

    const nextParams = new URLSearchParams({ discover: "1", view: "collection" });
    const title = searchParams.get("title");

    if (title) {
      nextParams.set("title", title);
    }

    setSearchParams(nextParams);
  };

  const renderFiltersDrawer = () => (
    <div className={`products-filter-panel ${isFilterOpen ? "is-open" : ""}`}>
      <FiltersSidebar
        brands={availableBrands}
        selectedBrand={draftFilters.brand}
        onBrandChange={(value) =>
          setDraftFilters((current) => ({ ...current, brand: value }))
        }
        categories={categories}
        selectedCategory={draftFilters.category}
        onCategoryChange={(value) => {
          setDraftFilters((current) => ({ ...current, category: value }));
          updateDiscoverParams({ category: value, promo: null });
        }}
        availabilityFilter={draftFilters.availability}
        onAvailabilityChange={(value) =>
          setDraftFilters((current) => ({ ...current, availability: value }))
        }
        minimumDiscount={draftFilters.minimumDiscount}
        onMinimumDiscountChange={(value) =>
          setDraftFilters((current) => ({ ...current, minimumDiscount: value }))
        }
        sortBy={draftFilters.sortBy}
        onSortChange={(value) =>
          setDraftFilters((current) => ({ ...current, sortBy: value }))
        }
        priceRange={draftFilters.priceRange}
        maxCatalogPrice={maxCatalogPrice}
        onPriceRangeChange={(value) =>
          setDraftFilters((current) => ({ ...current, priceRange: value }))
        }
        onClose={() => setIsFilterOpen(false)}
        onReset={resetCurrentFilters}
        onApply={applyDraftFilters}
        showCategoryFilter
        initialSection={activeFilterSection}
      />
    </div>
  );

  if (!hasProductDiscoveryParams) {
    return <Navigate replace to="/products?discover=1&view=collection" />;
  }

  return (
    <>
      {!isDiscoverMode ? (
        <>
          <section className="hero-banner">
            <div className="hero-banner__overlay">
              <div className="shell hero-banner__content">
                <div className="hero-copy">
                  <span className="eyebrow">Modern hardware storefront</span>
                  <h1>Source appliances, electricals, tools, hardware, and home essentials in one place.</h1>
                  <p>
                    Browse your catalog through focused product groups built around
                    appliances, electricals, power and hand tools, hardware,
                    lighting and fans, bathroom, plumbing, and kitchen needs.
                  </p>
                  <div className="hero-actions">
                    <Link className="button button--light" to="/products?discover=1">
                      Shop products
                    </Link>
                    <Link className="button button--ghost" to="/bulk-order">
                      Request bulk pricing
                    </Link>
                  </div>
                </div>

                <div className="hero-panel">
                  <div className="store-card hero-panel__card">
                    <span>Top category</span>
                    <strong>Appliances and project essentials</strong>
                    <p>Browse category-led inventory built for practical home and project needs.</p>
                  </div>
                  <div className="store-card hero-panel__card">
                    <span>Fast dispatch</span>
                    <strong>24-hour processing</strong>
                    <p>Popular SKUs ship quickly with secure packaging and order updates.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : null}

      <section className={`shell section page-section ${isCollectionMode ? "page-section--collection" : ""}`}>
        {!isDiscoverMode ? (
          <div className="page-header">
            <span className="eyebrow">Product listing</span>
            <h1>Category-driven product catalog</h1>
            <p>Browse the full Eldoo catalog in one place.</p>
          </div>
        ) : null}

        {isDiscoverMode && !isCollectionMode ? (
          <div className="products-filter-toggle-row">
            {draftFilters.category !== "All" ? (
              <div className="products-mobile-category-summary">
                <strong>{draftFilters.category}</strong>
                <span>{filteredProducts.length} products available</span>
              </div>
            ) : null}
            <button
              type="button"
              className="products-filter-toggle"
              onClick={() => openFilters("category")}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 6h16M7 12h10M10 18h4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span>Filters</span>
            </button>
          </div>
        ) : null}

        {isDiscoverMode ? renderFiltersDrawer() : null}

        {loading ? (
          <LoadingState cardCount={8} />
        ) : isCollectionMode ? (
          <div className="products-collection-page">
            <div className="products-collection-page__header">
              <h1>{collectionTitle}</h1>
            </div>
            <div className="products-collection-toolbar" aria-label={`${collectionTitle} filters`}>
              <button
                type="button"
                className="products-filter-toggle products-filter-toggle--icon"
                onClick={() => openFilters("category")}
                aria-label="Open filters"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 6h16M7 12h10M10 18h4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <button type="button" className="products-filter-chip" onClick={() => openFilters("category")}>
                Type
                <span aria-hidden="true">⌄</span>
              </button>
              <button type="button" className="products-filter-chip" onClick={() => openFilters("brand")}>
                Brand
                <span aria-hidden="true">⌄</span>
              </button>
              {collectionFilterChips.map((category) => {
                const categoryValue = category.slug || category.name;
                return (
                  <button
                    key={categoryValue}
                    type="button"
                    className={`products-filter-chip products-filter-chip--category ${
                      draftFilters.category === categoryValue ? "is-active" : ""
                    }`}
                    onClick={() => {
                      setDraftFilters((current) => ({ ...current, category: categoryValue }));
                      updateDiscoverParams({ category: categoryValue, promo: null });
                    }}
                  >
                    {category.image ? <img src={category.image} alt="" aria-hidden="true" /> : null}
                    <span>{category.name}</span>
                  </button>
                );
              })}
              <button type="button" className="products-filter-chip" onClick={() => openFilters("price")}>
                Price
                <span aria-hidden="true">⌄</span>
              </button>
            </div>
            <div className="product-grid products-collection-grid">
              {collectionProducts.map((product) => (
                <ProductCard key={product.id} product={product} compact />
              ))}
            </div>
            {!collectionProducts.length && (
              <div className="store-card empty-state">
                <h3>No products matched this collection.</h3>
                <p>Try another product group from the home page.</p>
              </div>
            )}
          </div>
        ) : isDiscoverMode ? (
          <div className="listing-layout">
            <div className="listing-layout__sidebar">
              <FiltersSidebar
                brands={availableBrands}
                selectedBrand={draftFilters.brand}
                onBrandChange={(value) =>
                  setDraftFilters((current) => ({ ...current, brand: value }))
                }
                categories={categories}
                selectedCategory={draftFilters.category}
                onCategoryChange={(value) => {
                  setDraftFilters((current) => ({ ...current, category: value }));
                  updateDiscoverParams({ category: value });
                }}
                availabilityFilter={draftFilters.availability}
                onAvailabilityChange={(value) =>
                  setDraftFilters((current) => ({ ...current, availability: value }))
                }
                minimumDiscount={draftFilters.minimumDiscount}
                onMinimumDiscountChange={(value) =>
                  setDraftFilters((current) => ({ ...current, minimumDiscount: value }))
                }
                sortBy={draftFilters.sortBy}
                onSortChange={(value) =>
                  setDraftFilters((current) => ({ ...current, sortBy: value }))
                }
                priceRange={draftFilters.priceRange}
                maxCatalogPrice={maxCatalogPrice}
                onPriceRangeChange={(value) =>
                  setDraftFilters((current) => ({ ...current, priceRange: value }))
                }
                onClose={() => setIsFilterOpen(false)}
                onReset={() => {
                  setDraftFilters({
                    category: "All",
                    brand: "All",
                    availability: "all" as ProductAvailabilityFilter,
                    minimumDiscount: 0,
                    sortBy: "featured" as ProductSort,
                    priceRange: { min: 0, max: maxCatalogPrice || 250000 },
                  });
                  resetFilters();
                  setSearchParams(new URLSearchParams({ discover: "1" }));
                }}
                onApply={applyDraftFilters}
                showCategoryFilter
              />
            </div>
            <div className="listing-layout__products">
              <div className="product-grid">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {!filteredProducts.length && (
                <div className="store-card empty-state">
                  <h3>No products matched your filters.</h3>
                  <p>Try changing the search, brand, category, price, discount, or availability filters.</p>
                </div>
              )}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {!filteredProducts.length && (
              <div className="store-card empty-state">
                <h3>No products are available right now.</h3>
                <p>New items added from inventory will appear here automatically.</p>
              </div>
            )}
          </>
        )}
      </section>

      {!isDiscoverMode ? (
        <>
          <section className="shell promo-grid">
            <article className="store-card promo-card promo-card--dark">
              <span className="eyebrow">Promo</span>
              <h3>Category-led product discovery</h3>
              <p>
                Move through your eight primary catalog groups with cleaner
                category-first browsing and management.
              </p>
              <Link to="/products?discover=1&category=appliances">Explore category</Link>
            </article>
            <article className="store-card promo-card promo-card--light">
              <span className="eyebrow">Business sales</span>
              <h3>Need 10+ units for your team?</h3>
              <p>
                Share your requirement and we’ll prepare model suggestions, pricing,
                and lead-time estimates.
              </p>
              <Link to="/bulk-order">Start bulk inquiry</Link>
            </article>
          </section>

          <section className="shell section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Best sellers</span>
                <h2>What customers are adding to carts most often</h2>
              </div>
            </div>
            {loading ? (
              <LoadingState />
            ) : (
              <div className="product-grid">
                {bestSellerProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}
    </>
  );
};

export default ProductsPage;
