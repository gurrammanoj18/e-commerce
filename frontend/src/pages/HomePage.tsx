import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/pages/HomePage.css";
import "../styles/pages/DesktopStorefront.css";
import CategoryCard from "../components/product/CategoryCard";
import ProductCard from "../components/product/ProductCard";
import LoadingState from "../components/shared/LoadingState";
import DesktopHomePage from "../components/home/DesktopHomePage";
import { useProducts } from "../contexts/ProductContext";
import { useAuth } from "../contexts/AuthContext";
import { BrandLogo, HomepageSectionContent, Product } from "../types/store";
import { fetchBrandLogos } from "../services/brandLogoService";
import { fetchHomepageSections } from "../services/homepageSectionService";
import { resolveMediaUrl } from "../utils/mediaUrl";
import { getHomepageSectionProducts } from "../utils/homepageSections";
import bannerOne from "../assets/banners/ban1.png";
import bannerTwo from "../assets/banners/ban2.png";
import contractorDeals from "../assets/promos/contractor-deals.png";
import servicesIcon from "../assets/categories/services.svg";
import walletIcon from "../assets/wallet.png";
import offerQualityImage from "../assets/offers/quality.png";
import offerCodImage from "../assets/offers/cod.png";
import offerDeliveryImage from "../assets/offers/delivery.png";
import offerCashbackImage from "../assets/offers/cashback.png";

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

interface ProductCarouselSectionProps {
  title: string;
  eyebrow: string;
  products: Product[];
  loading: boolean;
  seeAllTo: string;
}

interface HomeSectionDefinition {
  sectionKey: string;
  eyebrow: string;
  title: string;
  tags?: string[];
  displayOrder: number;
  maxProducts: number;
}

const buildSectionLink = (section: HomeSectionDefinition) => {
  const params = new URLSearchParams({
    discover: "1",
    view: "collection",
    section: section.sectionKey,
    title: section.title,
  });

  return `/products?${params.toString()}`;
};

interface PromoBanner {
  id: number;
  image: string;
  heading: string;
  slug: string;
}

const promoBanners: PromoBanner[] = [
  {
    id: -1,
    image: bannerOne,
    heading: "Summer Deals",
    slug: "summer",
  },
  {
    id: -2,
    image: bannerTwo,
    heading: "Monsoon Protection",
    slug: "monsoon",
  },
];

const homeHeroPanels = [
  {
    eyebrow: "Explore products",
    title: "Browse electricals, hardware and home essentials",
    description: "Discover the core marketplace collections from one polished storefront.",
    to: "/products?discover=1&view=collection",
    image: bannerOne,
    tone: "light",
  },
  {
    eyebrow: "Services",
    title: "Electrician, plumber, carpenter and painter support",
    description: "Move into service booking with the same familiar Eldoo experience.",
    to: "/services",
    image: servicesIcon,
    tone: "blue",
  },
  {
    eyebrow: "Bulk order",
    title: "Quote large quantities for contractors and projects",
    description: "Raise a bulk request when you need prices for bigger cart sizes.",
    to: "/bulk-order",
    image: contractorDeals,
    tone: "dark",
  },
];

const mobileOfferTiles = [
  { label: "Top Quality", image: offerQualityImage },
  { label: "COD Available", image: offerCodImage },
  { label: "Fast Delivery", image: offerDeliveryImage },
  { label: "Cashbacks", image: offerCashbackImage },
];

const homeSections: HomeSectionDefinition[] = [
  {
    sectionKey: "hard-to-find",
    eyebrow: "Hard-to-Find Products",
    title: "Hard-to-Find Products",
    tags: ["hard-to-find-products"],
    displayOrder: 10,
    maxProducts: 8,
  },
  {
    sectionKey: "everyday-essentials",
    eyebrow: "Everyday Essentials",
    title: "Everyday Essentials",
    tags: ["everyday-essentials"],
    displayOrder: 20,
    maxProducts: 8,
  },
  {
    sectionKey: "electrical-essentials",
    eyebrow: "Electrical Essentials",
    title: "Electrical Essentials",
    tags: ["electrical-essentials"],
    displayOrder: 30,
    maxProducts: 8,
  },
  {
    sectionKey: "hardware-tools",
    eyebrow: "Hardware & Tools",
    title: "Hardware & Tools",
    tags: ["hardware-tools"],
    displayOrder: 40,
    maxProducts: 8,
  },
  {
    sectionKey: "plumbing-bathroom",
    eyebrow: "Plumbing & Bathroom",
    title: "Plumbing & Bathroom",
    tags: ["plumbing-bathroom"],
    displayOrder: 50,
    maxProducts: 8,
  },
  {
    sectionKey: "recently-added",
    eyebrow: "Recently added products",
    title: "Recently Added",
    displayOrder: 70,
    maxProducts: 8,
  },
  {
    sectionKey: "best-selling",
    eyebrow: "Best-selling products",
    title: "Best-Selling Products",
    displayOrder: 80,
    maxProducts: 8,
  },
];

const getSectionCopy = (
  sections: HomepageSectionContent[],
  sectionKey: string,
  fallbackTagline: string,
  fallbackHeading: string,
) => {
  const section = sections.find((item) => item.sectionKey === sectionKey);

  return {
    tagline: section?.tagline || fallbackTagline,
    heading: section?.heading || fallbackHeading,
  };
};

const BrandSection: React.FC<{ contentSections: HomepageSectionContent[] }> = ({ contentSections }) => {
  const [brandLogos, setBrandLogos] = useState<BrandLogo[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadBrandLogos = async () => {
      try {
        const response = await fetchBrandLogos();
        if (isMounted) {
          setBrandLogos(response);
        }
      } catch {
        if (isMounted) {
          setBrandLogos([]);
        }
      }
    };

    void loadBrandLogos();

    return () => {
      isMounted = false;
    };
  }, []);

  const brands = brandLogos
    .filter((brand) => brand.active && brand.logoUrl)
    .slice()
    .sort((left, right) => left.displayOrder - right.displayOrder);
  const copy = getSectionCopy(contentSections, "shop-by-brand", "Shop by Brand", "Shop by Brand");

  return (
    <section id="shop-by-brand" className="shell section home-brand-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{copy.tagline}</span>
          <h2>{copy.heading}</h2>
        </div>
      </div>
      <div className="home-brand-grid">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            className="home-brand-card"
            to={`/products?discover=1&view=collection&brand=${encodeURIComponent(
              brand.brandName,
            )}&title=${encodeURIComponent(brand.brandName)}`}
          >
            <img src={resolveMediaUrl(brand.logoUrl)} alt={`${brand.brandName} logo`} loading="lazy" />
            <span>{brand.brandName}</span>
          </Link>
        ))}
      </div>
    </section>
  );
};

const buildPromoBannerLink = (banner: PromoBanner) => {
  const slug =
    banner.slug?.trim() ||
    banner.heading
      ?.toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  const heading = banner.heading?.trim() || "Promotional banner";

  if (!slug) {
    return "/products?discover=1&view=collection";
  }

  const params = new URLSearchParams({
    discover: "1",
    view: "collection",
    promo: slug,
    title: heading,
  });

  return `/products?${params.toString()}`;
};

const MidPageBannerCarousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const carouselBanners = promoBanners;

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
            {carouselBanners.map((banner, index) => (
              <Link
                key={banner.id}
                className="banner-carousel__slide banner-carousel__link"
                to={buildPromoBannerLink(banner)}
                aria-label={banner.heading ? `Shop ${banner.heading}` : `Shop banner ${index + 1}`}
              >
                <img src={banner.image} alt={banner.heading || `Eldoo banner ${index + 1}`} />
              </Link>
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
          {carouselBanners.map((banner, index) => (
            <button
              key={`${banner.image}-dot`}
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

const MobileReferenceHome: React.FC = () => {
  return (
    <section className="mobile-reference-home" aria-label="Eldoo home">
      <nav className="mobile-reference-home__tabs" aria-label="Featured shortcuts">
        <Link className="is-active" to="/products?discover=1&view=collection">Shop</Link>
        <Link to="/services">Services</Link>
        <Link to="/bulk-order">Bulk Order</Link>
      </nav>

      <Link className="mobile-reference-home__hero" to="/products?discover=1&view=collection&promo=summer&title=Popular">
        <img src={bannerOne} alt="Everything your home needs all in one place" />
      </Link>

      <div className="mobile-reference-home__offers">
        {mobileOfferTiles.map((tile) => (
          <div key={tile.label} className="mobile-reference-home__offer-tile">
            <span aria-hidden="true">
              <img src={tile.image} alt="" loading="lazy" />
            </span>
            <strong>{tile.label}</strong>
          </div>
        ))}
      </div>

    </section>
  );
};

const HomeWalletCard: React.FC<{ walletBalance: number }> = ({ walletBalance }) => (
  <section className="shell section home-wallet-section">
    <Link to="/wallet" className="home-wallet-card">
      <div className="home-wallet-card__copy">
        <span>My Wallet Balance</span>
        <strong>₹{walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
        <span className="home-wallet-card__action">Add Money</span>
        <small>+250 Reward Points</small>
      </div>
      <span className="home-wallet-card__icon" aria-hidden="true">
        <img src={walletIcon} alt="" />
      </span>
    </Link>
  </section>
);

const ProductCarouselSection: React.FC<ProductCarouselSectionProps> = ({
  title,
  eyebrow,
  products,
  loading,
  seeAllTo,
}) => {
  return (
    <section className="shell section home-product-section">
      <div className="section-heading section-heading--carousel">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
        </div>
        <div className="home-product-section__actions">
          <Link className="home-product-section__see-all" to={seeAllTo}>
            See All
            <span aria-hidden="true">›</span>
          </Link>
        </div>
      </div>
      {loading ? (
        <LoadingState />
      ) : products.length ? (
        <div className="home-carousel">
          <div className="home-carousel__viewport">
            <div className="product-grid product-grid--carousel">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} compact />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="home-carousel home-carousel--empty">
          <div className="home-carousel__viewport">
            <div className="home-carousel__empty-state">
              <strong>No products match this section yet.</strong>
              <span>Add products with the right admin tags to populate it.</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { bestSellerProducts, categories, loading, products } = useProducts();
  const [contentSections, setContentSections] = useState<HomepageSectionContent[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadHomepageSections = async () => {
      try {
        const contentResponse = await fetchHomepageSections();
        if (isMounted) {
          setContentSections(contentResponse);
        }
      } catch {
        if (isMounted) {
          setContentSections([]);
        }
      }
    };

    void loadHomepageSections();

    return () => {
      isMounted = false;
    };
  }, []);

  const recentlyAddedProducts = useMemo(
    () =>
      [...products]
        .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
        .slice(0, 8),
    [products]
  );

  const categoryShowcase = useMemo(() => categories, [categories]);
  const resolvedHomepageSections = useMemo(
    () =>
      [...homeSections]
        .sort((left, right) => left.displayOrder - right.displayOrder)
        .map((section) => {
          const copy = getSectionCopy(contentSections, section.sectionKey, section.eyebrow, section.title);
          const sectionProducts = getHomepageSectionProducts(
            section.sectionKey === "best-selling"
              ? bestSellerProducts
              : section.sectionKey === "recently-added"
                ? recentlyAddedProducts
                : products,
            section.sectionKey,
          );

          return {
            ...section,
            eyebrow: copy.tagline,
            title: copy.heading,
            products: sectionProducts.slice(0, section.maxProducts),
          };
        }),
    [bestSellerProducts, contentSections, products, recentlyAddedProducts]
  );
  const categoryCopy = getSectionCopy(contentSections, "categories", "Categories", "Shop by Category");
  const walletBalance = user?.walletBalance ?? 1250;
  const featuredCategories = useMemo(
    () =>
      categoryShowcase
        .filter((category) => category.name && category.count >= 0)
        .slice(0, 8),
    [categoryShowcase],
  );
  return (
    <>
      <DesktopHomePage
        categories={categoryShowcase.filter((category) => category.name && category.count >= 0)}
        sections={resolvedHomepageSections.map((section) => ({
          sectionKey: section.sectionKey,
          title: section.title,
          eyebrow: section.eyebrow,
          products: section.products,
          seeAllTo: buildSectionLink(section),
        }))}
        walletBalance={walletBalance}
        loading={loading}
      />
      <MobileReferenceHome />

      <div className="legacy-home-content">
      <section className="shell section home-hero-section">
        <div className="home-hero">
          <div className="home-hero__copy">
            <span className="eyebrow">Eldoo marketplace</span>
            <h1>Everything for Your Home, Business &amp; Projects</h1>
            <p>
              A cleaner storefront for shopping products, booking services, and placing
              bulk requests from one app-like experience.
            </p>
            <div className="home-hero__actions">
              <Link className="button" to="/products?discover=1&view=collection">
                Shop products
              </Link>
              <Link className="button button--light" to="/services">
                Book services
              </Link>
              <Link className="button button--ghost" to="/bulk-order">
                Request quote
              </Link>
            </div>
          </div>

          <div className="home-hero__panels">
            {homeHeroPanels.map((panel) => (
              <Link
                key={panel.title}
                className={`home-hero-panel home-hero-panel--${panel.tone}`}
                to={panel.to}
              >
                <div className="home-hero-panel__copy">
                  <span>{panel.eyebrow}</span>
                  <strong>{panel.title}</strong>
                  <p>{panel.description}</p>
                </div>
                <div className="home-hero-panel__media">
                  <img src={panel.image} alt={panel.title} loading="lazy" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <MidPageBannerCarousel />

      <section className="shell section home-category-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{categoryCopy.tagline}</span>
            <h2>{categoryCopy.heading}</h2>
          </div>
          <Link className="home-product-section__see-all" to="/categories">
            See All
            <span aria-hidden="true">›</span>
          </Link>
        </div>
        <div className="category-grid">
          {featuredCategories.map((category) => (
            <CategoryCard key={category.name} category={category} />
          ))}
        </div>
      </section>

      <HomeWalletCard walletBalance={walletBalance} />

      {resolvedHomepageSections.slice(0, 2).map((section) => (
        <ProductCarouselSection
          key={section.sectionKey}
          eyebrow={section.eyebrow}
          title={section.title}
          products={section.products}
          loading={loading}
          seeAllTo={buildSectionLink(section)}
        />
      ))}

      <BrandSection contentSections={contentSections} />

      {resolvedHomepageSections.slice(2, 5).map((section) => (
        <ProductCarouselSection
          key={section.sectionKey}
          eyebrow={section.eyebrow}
          title={section.title}
          products={section.products}
          loading={loading}
          seeAllTo={buildSectionLink(section)}
        />
      ))}

      {resolvedHomepageSections.slice(5).map((section) => (
        <ProductCarouselSection
          key={section.sectionKey}
          eyebrow={section.eyebrow}
          title={section.title}
          products={section.products}
          loading={loading}
          seeAllTo={buildSectionLink(section)}
        />
      ))}

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
      </div>
    </>
  );
};

export default HomePage;
