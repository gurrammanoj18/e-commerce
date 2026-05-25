import React, { useEffect, useMemo, useState } from "react";
import "../styles/pages/HomePage.css";
import CategoryCard from "../components/product/CategoryCard";
import ProductCard from "../components/product/ProductCard";
import LoadingState from "../components/shared/LoadingState";
import { useProducts } from "../contexts/ProductContext";
import { Product } from "../types/store";

const walletRewards = [
  {
    title: "Wallet cashback",
    value: "5% back",
    copy: "Earn wallet rewards on prepaid orders and use them on your next upgrade.",
  },
  {
    title: "Referral bonus",
    value: "Rs. 500",
    copy: "Invite teammates and unlock bonus balance after their first delivered order.",
  },
  {
    title: "Loyalty tier",
    value: "Double points",
    copy: "Featured launches and festival campaigns unlock higher wallet multipliers.",
  },
];

const getItemsPerPage = () => {
  if (window.innerWidth <= 820) {
    return 1;
  }
  if (window.innerWidth <= 1080) {
    return 2;
  }
  return 4;
};

const chunkProducts = (products: Product[], size: number) => {
  const pages: Product[][] = [];

  for (let index = 0; index < products.length; index += size) {
    pages.push(products.slice(index, index + size));
  }

  return pages;
};

interface ProductCarouselSectionProps {
  title: string;
  eyebrow: string;
  description: string;
  products: Product[];
  loading: boolean;
}

const ProductCarouselSection: React.FC<ProductCarouselSectionProps> = ({
  title,
  eyebrow,
  description,
  products,
  loading,
}) => {
  const [itemsPerPage, setItemsPerPage] = useState(() =>
    typeof window === "undefined" ? 4 : getItemsPerPage()
  );
  const [activePage, setActivePage] = useState(0);

  useEffect(() => {
    const handleResize = () => setItemsPerPage(getItemsPerPage());

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const productPages = useMemo(
    () => chunkProducts(products, itemsPerPage),
    [itemsPerPage, products]
  );

  useEffect(() => {
    setActivePage((currentPage) =>
      Math.min(currentPage, Math.max(productPages.length - 1, 0))
    );
  }, [productPages.length]);

  return (
    <section className="shell section">
      <div className="section-heading section-heading--carousel">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {!loading && productPages.length > 1 ? (
          <div className="carousel-controls" aria-label={`${title} controls`}>
            <button
              type="button"
              className="carousel-controls__button"
              onClick={() => setActivePage((page) => Math.max(page - 1, 0))}
              disabled={activePage === 0}
              aria-label={`Show previous ${title.toLowerCase()}`}
            >
              ←
            </button>
            <span className="carousel-controls__status">
              {activePage + 1}/{productPages.length}
            </span>
            <button
              type="button"
              className="carousel-controls__button"
              onClick={() =>
                setActivePage((page) => Math.min(page + 1, productPages.length - 1))
              }
              disabled={activePage === productPages.length - 1}
              aria-label={`Show more ${title.toLowerCase()}`}
            >
              →
            </button>
          </div>
        ) : null}
      </div>
      {loading ? (
        <LoadingState />
      ) : (
        <div className="home-carousel">
          <div className="home-carousel__viewport">
            <div
              className="home-carousel__track"
              style={{ transform: `translateX(-${activePage * 100}%)` }}
            >
              {productPages.map((page, pageIndex) => (
                <div key={`${title}-${pageIndex}`} className="home-carousel__slide">
                  <div className="product-grid product-grid--carousel">
                    {page.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const HomePage: React.FC = () => {
  const { bestSellerProducts, categories, featuredProducts, loading, products } =
    useProducts();

  const trendingProducts = useMemo(
    () =>
      [...products].sort(
        (left, right) =>
          right.rating * right.reviewCount - left.rating * left.reviewCount
      ),
    [products]
  );

  const recentlyAddedProducts = useMemo(() => {
    const newArrivals = products.filter((product) => product.newArrival);
    return newArrivals.length ? newArrivals : products;
  }, [products]);

  const categoryShowcase = useMemo(() => categories, [categories]);

  return (
    <>
      <section className="hero-banner hero-banner--homepage">
        <div className="hero-banner__overlay">
          <div className="shell hero-banner__content hero-banner__content--homepage">
            <div className="hero-copy">
              <span className="eyebrow">Modern shopping homepage</span>
              <h1>Browse, filter, and slide through products without leaving the page.</h1>
              <p>
                Let shoppers use the navbar search and pincode selector, browse
                categories, and move through curated product rows with quick arrow
                controls from the homepage.
              </p>
            </div>

            <div className="hero-panel hero-panel--homepage">
              <div className="store-card hero-panel__card">
                <span>Trending now</span>
                <strong>Swipe-style product discovery</strong>
                <p>Move through popular products from the homepage with a single click.</p>
              </div>
              <div className="store-card hero-panel__card">
                <span>Fresh arrivals</span>
                <strong>Recently added items stay visible</strong>
                <p>New products rotate inline instead of sending shoppers to another screen.</p>
              </div>
              <div className="store-card hero-panel__card hero-panel__card--compact">
                <span>Featured reach</span>
                <strong>{featuredProducts.length}+ featured SKUs</strong>
                <p>Keep best sellers, new arrivals, and spotlight items in one landing flow.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shell section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Categories</span>
            <h2>Shop by Category</h2>
          </div>
        </div>
        <div className="category-grid">
          {categoryShowcase.map((category) => (
            <CategoryCard key={category.name} category={category} />
          ))}
        </div>
      </section>

      <ProductCarouselSection
        eyebrow="Trending products"
        title="High-interest picks shoppers are engaging with now"
        description="Use the arrow controls to slide through more trending products."
        products={trendingProducts}
        loading={loading}
      />

      <ProductCarouselSection
        eyebrow="Recently added products"
        title="Fresh arrivals ready for discovery"
        description="New products slide in place so shoppers can keep browsing without a page jump."
        products={recentlyAddedProducts}
        loading={loading}
      />

      <section className="shell wallet-rewards store-card section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Wallet rewards</span>
            <h2>Reward repeat shoppers and campaign participation</h2>
          </div>
        </div>
        <div className="wallet-rewards__grid">
          {walletRewards.map((reward) => (
            <article key={reward.title} className="wallet-reward-card">
              <span>{reward.title}</span>
              <strong>{reward.value}</strong>
              <p>{reward.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <ProductCarouselSection
        eyebrow="Best-selling products"
        title="Proven performers that convert consistently"
        description="Move right to reveal more top sellers from the same row."
        products={bestSellerProducts}
        loading={loading}
      />

      <ProductCarouselSection
        eyebrow="Featured products"
        title="Homepage spotlight products"
        description="Featured items slide in as you browse, keeping the homepage focused."
        products={featuredProducts}
        loading={loading}
      />
    </>
  );
};

export default HomePage;
