import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/pages/HomePage.css";
import DiscoverySection from "../components/discovery/DiscoverySection";
import CategoryCard from "../components/product/CategoryCard";
import ProductCard from "../components/product/ProductCard";
import LoadingState from "../components/shared/LoadingState";
import { useProducts } from "../contexts/ProductContext";
import { Banner, Product } from "../types/store";
import { fetchBanners } from "../services/bannerService";
import bannerOne from "../assets/banners/ban1.png";
import bannerTwo from "../assets/banners/ban2.png";
import bannerThree from "../assets/banners/ban4.png";
import anchorLogo from "../assets/brands/anchor.jpg";
import finolexLogo from "../assets/brands/finolex.jpg";
import gmLogo from "../assets/brands/gm.png";
import godrejLogo from "../assets/brands/godrej.jpg";
import havellsLogo from "../assets/brands/havells.jpg";
import legrandLogo from "../assets/brands/legrand.jpg";
import philipsLogo from "../assets/brands/philips.jpg";
import polycabLogo from "../assets/brands/polycab.jpg";

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
  products: Product[];
  loading: boolean;
}

const promoBanners = [bannerOne, bannerTwo, bannerThree];

const defaultBrandLogos: Record<string, string> = {
  Anchor: anchorLogo,
  GM: gmLogo,
  Havells: havellsLogo,
  Polycab: polycabLogo,
  Finolex: finolexLogo,
  Legrand: legrandLogo,
  Philips: philipsLogo,
  Godrej: godrejLogo,
};

const seasonalModules = [
  {
    title: "Summer Cooling Picks",
    copy: "Fans, extension boards, coolers, and wiring essentials for hot-weather demand.",
    to: "/products?discover=1&search=fan",
  },
  {
    title: "Monsoon Protection",
    copy: "Waterproof tape, sealants, outdoor switches, pipe fittings, and safety consumables.",
    to: "/products?discover=1&search=waterproof",
  },
  {
    title: "Festival Lighting",
    copy: "LED bulbs, holders, extension boards, decorative lighting, and quick replacements.",
    to: "/products?discover=1&search=light",
  },
  {
    title: "Contractor Bulk Deals",
    copy: "Fast-moving project stock for electricians, plumbers, fabricators, and site teams.",
    to: "/bulk-order",
  },
];

const productMatches = (product: Product, keywords: string[]) => {
  const searchable = [
    product.name,
    product.brand,
    product.category,
    product.categorySlug,
    product.subcategory,
    product.subcategorySlug,
    product.shortDescription,
    product.description,
    ...product.tags,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return keywords.some((keyword) => searchable.includes(keyword.toLowerCase()));
};

const pickSectionProducts = (
  products: Product[],
  keywords: string[],
  fallbackProducts: Product[],
) => {
  const matchedProducts = products.filter((product) => productMatches(product, keywords));
  return matchedProducts.length ? matchedProducts : fallbackProducts;
};

const BrandSection: React.FC<{ products: Product[] }> = ({ products }) => {
  const brands = Array.from(
    products.reduce((brandMap, product) => {
      if (!product.brand || brandMap.has(product.brand)) {
        return brandMap;
      }
      brandMap.set(product.brand, {
        name: product.brand,
        logoUrl: defaultBrandLogos[product.brand] || product.brandLogoUrl || "",
      });
      return brandMap;
    }, new Map<string, { name: string; logoUrl: string }>())
  )
    .map(([, brand]) => brand)
    .sort((left, right) => {
      const preferred = Object.keys(defaultBrandLogos);
      const leftIndex = preferred.indexOf(left.name);
      const rightIndex = preferred.indexOf(right.name);
      if (leftIndex !== -1 || rightIndex !== -1) {
        return (leftIndex === -1 ? preferred.length : leftIndex) - (rightIndex === -1 ? preferred.length : rightIndex);
      }
      return left.name.localeCompare(right.name);
    })
    .slice(0, 12);

  return (
    <section className="shell section home-brand-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Shop by Brand</span>
          <h2>Major brands customers ask for</h2>
        </div>
      </div>
      <div className="home-brand-grid">
        {brands.map((brand) => (
          <Link
            key={brand.name}
            className="home-brand-card"
            to={`/products?discover=1&brand=${encodeURIComponent(brand.name)}`}
          >
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt={`${brand.name} logo`} loading="lazy" />
            ) : (
              <strong>{brand.name.slice(0, 2).toUpperCase()}</strong>
            )}
            <span>{brand.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
};

const SeasonalModulesSection: React.FC = () => (
  <section className="shell section home-seasonal-section">
    <div className="section-heading">
      <div>
        <span className="eyebrow">Seasonal picks</span>
        <h2>Fast modules for timely demand</h2>
      </div>
    </div>
    <div className="home-seasonal-grid">
      {seasonalModules.map((module) => (
        <Link key={module.title} className="home-seasonal-card" to={module.to}>
          <strong>{module.title}</strong>
          <span>{module.copy}</span>
        </Link>
      ))}
    </div>
  </section>
);

const MidPageBannerCarousel: React.FC<{ banners: string[] }> = ({ banners }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const carouselBanners = banners.length ? banners : promoBanners;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % carouselBanners.length);
    }, 3500);

    return () => window.clearInterval(intervalId);
  }, [carouselBanners.length]);

  useEffect(() => {
    setActiveIndex((currentIndex) => Math.min(currentIndex, carouselBanners.length - 1));
  }, [carouselBanners.length]);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) {
      return;
    }

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
    const deltaX = touchEndX - touchStartX;

    if (Math.abs(deltaX) < 45) {
      setTouchStartX(null);
      return;
    }

    setActiveIndex((currentIndex) =>
      deltaX < 0
        ? (currentIndex + 1) % carouselBanners.length
        : currentIndex === 0
          ? carouselBanners.length - 1
          : currentIndex - 1
    );
    setTouchStartX(null);
  };

  return (
    <section className="section">
      <div className="banner-carousel">
        <div
          className="banner-carousel__viewport"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="banner-carousel__track"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {carouselBanners.map((bannerImage, index) => (
              <div key={bannerImage} className="banner-carousel__slide">
                <img src={bannerImage} alt={`VoltMart banner ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="banner-carousel__arrow banner-carousel__arrow--prev"
          onClick={() =>
            setActiveIndex((currentIndex) =>
              currentIndex === 0 ? carouselBanners.length - 1 : currentIndex - 1
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
            setActiveIndex((currentIndex) => (currentIndex + 1) % carouselBanners.length)
          }
          aria-label="Show next banner"
        >
          →
        </button>

        <div className="banner-carousel__dots" aria-label="Banner slides">
          {carouselBanners.map((bannerImage, index) => (
            <button
              key={`${bannerImage}-dot`}
              type="button"
              className={index === activeIndex ? "is-active" : ""}
              onClick={() => setActiveIndex(index)}
              aria-label={`Show banner ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

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
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => setItemsPerPage(getItemsPerPage());

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null || productPages.length <= 1) {
      return;
    }

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
    const deltaX = touchEndX - touchStartX;

    if (Math.abs(deltaX) < 45) {
      setTouchStartX(null);
      return;
    }

    setActivePage((currentPage) => {
      if (deltaX < 0) {
        return Math.min(currentPage + 1, productPages.length - 1);
      }

      return Math.max(currentPage - 1, 0);
    });

    setTouchStartX(null);
  };

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
          <div
            className="home-carousel__viewport"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
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
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadBanners = async () => {
      try {
        const response = await fetchBanners();
        if (isMounted) {
          setBanners(response);
        }
      } catch {
        if (isMounted) {
          setBanners([]);
        }
      }
    };

    void loadBanners();

    return () => {
      isMounted = false;
    };
  }, []);

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
  const fallbackProducts = useMemo(
    () => (trendingProducts.length ? trendingProducts : products),
    [products, trendingProducts]
  );
  const everydayEssentials = useMemo(
    () =>
      pickSectionProducts(
        products,
        ["led bulb", "switch", "wire", "tap", "extension", "pvc tape", "holder", "cleaning"],
        fallbackProducts
      ),
    [fallbackProducts, products]
  );
  const electricalEssentials = useMemo(
    () =>
      pickSectionProducts(
        products,
        ["electrical", "switch", "socket", "wire", "mcb", "distribution box", "fan regulator"],
        fallbackProducts
      ),
    [fallbackProducts, products]
  );
  const hardwareTools = useMemo(
    () =>
      pickSectionProducts(
        products,
        ["hardware", "tool", "lock", "handle", "hinge", "screw", "hammer", "spanner", "screwdriver"],
        fallbackProducts
      ),
    [fallbackProducts, products]
  );
  const plumbingBathroom = useMemo(
    () =>
      pickSectionProducts(
        products,
        ["plumbing", "bathroom", "pipe", "tap", "fitting", "connector", "shower"],
        fallbackProducts
      ),
    [fallbackProducts, products]
  );

  return (
    <>
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

      <MidPageBannerCarousel banners={banners.map((banner) => banner.imageUrl).filter(Boolean)} />

      <ProductCarouselSection
        eyebrow="Everyday Essentials"
        title="Fast-moving items customers use regularly"
        products={everydayEssentials}
        loading={loading}
      />

      <BrandSection products={products} />

      <ProductCarouselSection
        eyebrow="Electrical Essentials"
        title="Switches, sockets, wires, MCBs, and power basics"
        products={electricalEssentials}
        loading={loading}
      />

      <ProductCarouselSection
        eyebrow="Hardware & Tools"
        title="Locks, handles, hinges, fasteners, and tool kits"
        products={hardwareTools}
        loading={loading}
      />

      <ProductCarouselSection
        eyebrow="Plumbing & Bathroom"
        title="Pipes, taps, fittings, connectors, and shower sets"
        products={plumbingBathroom}
        loading={loading}
      />

      <SeasonalModulesSection />

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
