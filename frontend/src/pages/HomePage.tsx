import React, { useEffect, useMemo, useState } from "react";
import "../styles/pages/HomePage.css";
import CategoryCard from "../components/product/CategoryCard";
import ProductCard from "../components/product/ProductCard";
import LoadingState from "../components/shared/LoadingState";
import { useProducts } from "../contexts/ProductContext";
import { Product } from "../types/store";
import banner from "../assets/banners/banner.png";
import banner1 from "../assets/banners/banner1.png";
import banner2 from "../assets/banners/banner2.png";
import banner4 from "../assets/banners/banner4.png";

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

const homepageBanners = [
  {
    image: banner,
    alt: "VoltMart banner featuring everyday hardware, home utility, and accessories",
  },
  {
    image: banner1,
    alt: "VoltMart savings banner with big deals across product categories",
  },
  {
    image: banner2,
    alt: "VoltMart category banner showing hardware, home utility, and accessories",
  },
  {
    image: banner4,
    alt: "VoltMart offers banner highlighting savings and fast delivery",
  },
];

const BannerCarousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % homepageBanners.length);
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section className="banner-carousel" aria-label="Homepage banners">
      <div className="banner-carousel__viewport">
        <div
          className="banner-carousel__track"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {homepageBanners.map((slide) => (
            <div className="banner-carousel__slide" key={slide.image}>
              <img src={slide.image} alt={slide.alt} />
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
            key={slide.image}
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

      <ProductCarouselSection
        eyebrow="Featured products"
        title="Homepage spotlight products"
        products={featuredProducts}
        loading={loading}
      />
    </>
  );
};

export default HomePage;
