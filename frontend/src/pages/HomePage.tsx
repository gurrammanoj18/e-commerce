import React from "react";
import { Link } from "react-router-dom";
import CategoryCard from "../components/product/CategoryCard";
import ProductCard from "../components/product/ProductCard";
import LoadingState from "../components/shared/LoadingState";
import { useProducts } from "../contexts/ProductContext";

const HomePage: React.FC = () => {
  const { bestSellerProducts, categories, featuredProducts, loading } = useProducts();

  return (
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
                <Link className="button button--light" to="/products">
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

      <section className="shell section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Featured products</span>
            <h2>Curated launches and high-demand essentials</h2>
          </div>
          <Link to="/products">Browse catalog</Link>
        </div>
        {loading ? (
          <LoadingState />
        ) : (
          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="shell section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Categories</span>
            <h2>Shop by setup and use case</h2>
          </div>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <CategoryCard key={category.name} category={category} />
          ))}
        </div>
      </section>

      <section className="shell promo-grid">
        <article className="store-card promo-card promo-card--dark">
          <span className="eyebrow">Promo</span>
          <h3>Creator workstation week</h3>
          <p>
            Save on displays, docking stations, wireless audio, and accessory
            bundles built for production desks.
          </p>
          <Link to="/products?category=Components">Explore bundles</Link>
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
  );
};

export default HomePage;
