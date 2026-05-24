import React, { useEffect, useMemo, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import FiltersSidebar from "../components/product/FiltersSidebar";
import ProductCard from "../components/product/ProductCard";
import LoadingState from "../components/shared/LoadingState";
import SearchBar from "../components/shared/SearchBar";
import { useProducts } from "../contexts/ProductContext";

const ProductsPage: React.FC = () => {
  const {
    bestSellerProducts,
    categories,
    filteredProducts,
    loading,
    maxCatalogPrice,
    priceRange,
    resetFilters,
    searchTerm,
    selectedCategory,
    setPriceRange,
    setSearchTerm,
    setSelectedCategory,
    setSortBy,
    sortBy,
  } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const appliedQuerySignature = useRef("");

  const isDiscoverMode = useMemo(
    () =>
      searchParams.get("discover") === "1" ||
      Boolean(searchParams.get("search")) ||
      Boolean(searchParams.get("category")),
    [searchParams],
  );

  useEffect(() => {
    const nextSearch = searchParams.get("search") ?? "";
    const nextCategory = searchParams.get("category") ?? "All";
    const signature = `${isDiscoverMode}|${nextSearch}|${nextCategory}`;

    if (appliedQuerySignature.current === signature) {
      return;
    }

    if (isDiscoverMode) {
      setSearchTerm(nextSearch);
      setSelectedCategory(nextCategory);
    } else {
      resetFilters();
    }

    appliedQuerySignature.current = signature;
  }, [isDiscoverMode, resetFilters, searchParams, setSearchTerm, setSelectedCategory]);

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

  return (
    <>
      {!isDiscoverMode ? (
        <>
          <section className="hero-banner">
            <div className="hero-banner__overlay">
              <div className="shell hero-banner__content">
                <div className="hero-copy">
                  <span className="eyebrow">Modern hardware storefront</span>
                  <h1>Build smarter workspaces with trusted electronics.</h1>
                  <p>
                    Explore laptops, audio, networking, gaming, and business-ready
                    hardware designed for teams, creators, and enthusiasts.
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
                    <strong>Networking & office setups</strong>
                    <p>Upgrade your home office, studio, or team floor with high-uptime gear.</p>
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

      <section className="shell section page-section">
        <div className="page-header">
          <span className="eyebrow">Product listing</span>
          <h1>Hardware & electronics catalog</h1>
          <p>
            {isDiscoverMode
              ? "Search products, filter by category, and narrow the catalog by price and ranking."
              : "Browse the full VoltMart catalog in one place."}
          </p>
        </div>

        {isDiscoverMode ? (
          <div className="listing-toolbar">
            <SearchBar
              value={searchTerm}
              onChange={(value) => {
                setSearchTerm(value);
                updateDiscoverParams({ search: value });
              }}
            />
            <div className="listing-summary">
              <strong>{filteredProducts.length}</strong>
              <span>products matched</span>
            </div>
          </div>
        ) : null}

        {loading ? (
          <LoadingState cardCount={8} />
        ) : isDiscoverMode ? (
          <div className="listing-layout">
            <FiltersSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={(value) => {
                setSelectedCategory(value);
                updateDiscoverParams({ category: value });
              }}
              sortBy={sortBy}
              onSortChange={setSortBy}
              priceRange={priceRange}
              maxCatalogPrice={maxCatalogPrice}
              onPriceRangeChange={setPriceRange}
              onReset={() => {
                resetFilters();
                setSearchParams(new URLSearchParams({ discover: "1" }));
              }}
              showCategoryFilter
            />

            <div>
              <div className="product-grid">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {!filteredProducts.length && (
                <div className="store-card empty-state">
                  <h3>No products matched your filters.</h3>
                  <p>Try changing the search, category, or price range.</p>
                </div>
              )}
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
              <h3>Creator workstation week</h3>
              <p>
                Save on displays, docking stations, wireless audio, and accessory
                bundles built for production desks.
              </p>
              <Link to="/products?discover=1&category=Components">Explore bundles</Link>
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
