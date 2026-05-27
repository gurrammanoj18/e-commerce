import React, { useEffect, useMemo, useState } from "react";
import "../styles/pages/HomePage.css";
import DiscoverySection from "../components/discovery/DiscoverySection";
import CategoryCard from "../components/product/CategoryCard";
import ProductCard from "../components/product/ProductCard";
import LoadingState from "../components/shared/LoadingState";
import { useProducts } from "../contexts/ProductContext";
import { Banner, Product } from "../types/store";
import { fetchActiveBanners } from "../services/bannerService";
import banner1 from "../assets/banners/ban1.jpeg";
import banner2 from "../assets/banners/ban2.jpeg";

import banner4 from "../assets/banners/ban4.jpeg";

const WhyShopIconBoxes = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 14 32 8l10 6-10 6-10-6Z" />
      <path d="M22 14v12l10 6V20l-10-6Zm20 0v12l-10 6" />
      <path d="M10 28l10-6 10 6-10 6-10-6Z" />
      <path d="M10 28v12l10 6V34L10 28Zm20 0v12l-10 6" />
      <path d="M34 28l10-6 10 6-10 6-10-6Z" />
      <path d="M34 28v12l10 6V34l-10-6Zm20 0v12l-10 6" />
    </g>
  </svg>
);

const WhyShopIconTag = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 14h20l11 11v25a4 4 0 0 1-4 4H21a4 4 0 0 1-4-4V14Z" />
      <path d="M37 14v11h11" />
      <path d="M23 38h18M26 28h11" />
      <path d="M30 42c0 3 2 5 5 5s5-2 5-5-2-5-5-5-5-2-5-5 2-5 5-5 5 2 5 5" />
    </g>
  </svg>
);

const WhyShopIconTruck = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 18h29v22H10z" />
      <path d="M39 25h9l6 7v8H39z" />
      <path d="M18 48a4 4 0 1 0 0 .1Zm28 0a4 4 0 1 0 0 .1ZM22 48h20M50 48h4M10 48h4" />
      <path d="M39 32h15" />
    </g>
  </svg>
);

const WhyShopIconBadge = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m32 10 5 4 7-1 3 6 7 2-1 7 4 5-4 5 1 7-7 2-3 6-7-1-5 4-5-4-7 1-3-6-7-2 1-7-4-5 4-5-1-7 7-2 3-6 7 1 5-4Z" />
      <path d="m24 32 5 5 11-11" />
    </g>
  </svg>
);

const whyShopItems = [
  {
    title: "Wide Selection of Brands & Products",
    Icon: WhyShopIconBoxes,
  },
  {
    title: "Transparent & Competitive Pricing",
    Icon: WhyShopIconTag,
  },
  {
    title: "Fast & Ontime Delivery",
    Icon: WhyShopIconTruck,
  },
  {
    title: "100% Authentic Products",
    Icon: WhyShopIconBadge,
  },
];

const getItemsPerPage = () => {
  if (window.innerWidth <= 820) {
    return 1;
  }
  if (window.innerWidth <= 1080) {
    return 2;
  }
  return 3;
};

const chunkProducts = (products: Product[], size: number) => {
  const pages: Product[][] = [];

  for (let index = 0; index < products.length; index += size) {
    pages.push(products.slice(index, index + size));
  }

  return pages;
};

const fallbackBanners = [
  {
    id: 1,
    title: "Quality essentials",
    image: banner1,
    subtitle: "Reliable tools, appliances, and home basics for everyday work.",
  },
  {
    id: 2,
    title: "Everyday savings",
    image: banner2,
    subtitle: "Practical pricing on fast-moving products for homes and teams.",
  },
  {
    id: 3,
    title: "Big deals",
    image: banner4,
    subtitle: "Spotlight offers across electrical, hardware, and cleaning lines.",
  },
];

const BannerCarousel: React.FC = () => {
  const [slides, setSlides] = useState<Banner[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const banners = await fetchActiveBanners();
        setSlides(banners);
      } catch {
        setSlides([]);
      }
    };
    void loadBanners();
  }, []);

  const homepageBanners = slides.length
    ? slides.map((banner) => ({
        key: banner.id,
        image: banner.imageUrl,
        alt: banner.title,
        title: banner.title,
        subtitle: banner.subtitle,
        ctaLabel: banner.ctaLabel,
        ctaHref: banner.ctaHref,
      }))
    : fallbackBanners.map((banner) => ({
        key: banner.id,
        image: banner.image,
        alt: banner.title,
        title: banner.title,
        subtitle: banner.subtitle,
        ctaLabel: "Shop now",
        ctaHref: "/products?discover=1",
      }));
  const bannerCount = homepageBanners.length;

  useEffect(() => {
    if (bannerCount <= 1) {
      setActiveIndex(0);
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % bannerCount);
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [bannerCount]);

  return (
    <section className="banner-carousel" aria-label="Homepage banners">
      <div className="banner-carousel__viewport">
        <div
          className="banner-carousel__track"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {homepageBanners.map((slide) => (
            <div className="banner-carousel__slide" key={slide.key}>
              <a
                className="banner-carousel__link"
                href={slide.ctaHref || "/products?discover=1"}
                aria-label={slide.alt}
              >
                <img src={slide.image} alt={slide.alt} />
              </a>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="banner-carousel__arrow banner-carousel__arrow--prev"
        onClick={() =>
          setActiveIndex((currentIndex) =>
            currentIndex === 0 ? homepageBanners.length - 1 : currentIndex - 1
          )
        }
        aria-label="Show previous banner"
      >
        ←
      </button>
      <button
        type="button"
        className="banner-carousel__arrow banner-carousel__arrow--next"
        onClick={() =>
          setActiveIndex((currentIndex) => (currentIndex + 1) % homepageBanners.length)
        }
        aria-label="Show next banner"
      >
        →
      </button>

      <div className="banner-carousel__dots" aria-label="Banner slide selector">
        {homepageBanners.map((slide, index) => (
          <button
            key={slide.key}
            type="button"
            className={index === activeIndex ? "is-active" : ""}
            onClick={() => setActiveIndex(index)}
            aria-label={`Show banner ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

interface ProductCarouselSectionProps {
  title: string;
  eyebrow: string;
  products: Product[];
  loading: boolean;
}

const ProductCarouselSection: React.FC<ProductCarouselSectionProps> = ({
  title,
  eyebrow,
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
  const { bestSellerProducts, categories, loading, products } = useProducts();

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
      <BannerCarousel />

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
        products={trendingProducts}
        loading={loading}
      />

      <ProductCarouselSection
        eyebrow="Recently added products"
        title="Fresh arrivals ready for discovery"
        products={recentlyAddedProducts}
        loading={loading}
      />

      <ProductCarouselSection
        eyebrow="Best-selling products"
        title="Proven performers that convert consistently"
        products={bestSellerProducts}
        loading={loading}
      />

      <section className="section home-discovery-section">
        <DiscoverySection />
      </section>

      <section className="section home-why-shop-section">
        <div className="shell">
          <div className="home-why-shop">
            <h2>Why Shop with us?</h2>
            <div className="home-why-shop__grid">
              {whyShopItems.map(({ title, Icon }) => (
                <article key={title} className="home-why-shop__card">
                  <span className="home-why-shop__icon">
                    <Icon />
                  </span>
                  <h3>{title}</h3>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
