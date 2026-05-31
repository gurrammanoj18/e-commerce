import React, { useMemo, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useProducts } from "../../contexts/ProductContext";
import { Product } from "../../types/store";
import "../../styles/components/DiscoverySection.css";

const TILE_COUNT = 12;

const buildDiscoveryTiles = (products: Product[]) => {
  if (products.length === 0) {
    return [];
  }

  return Array.from({ length: TILE_COUNT }, (_, index) => products[index % products.length]);
};

const DiscoverySection: React.FC = () => {
  const sectionRef = useRef(null);
  const { bestSellerProducts, featuredProducts, products } = useProducts();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Left + Right columns → move UP
  const yLeft = useTransform(scrollYProgress, [0, 1], [-100, +100]);
  const yRight = useTransform(scrollYProgress, [0, 1], [-100, +100]);

  // Middle column → move DOWN (opposite direction)
  const yMiddle = useTransform(scrollYProgress, [0, 1], [+100, -100]);

  const discoveryTiles = useMemo(() => {
    const sourceProducts =
      bestSellerProducts.length > 0
        ? bestSellerProducts
        : featuredProducts.length > 0
          ? featuredProducts
          : products;

    return buildDiscoveryTiles(
      sourceProducts.filter((product) => product.images.length > 0)
    );
  }, [bestSellerProducts, featuredProducts, products]);
  const leftColumnTiles = discoveryTiles.filter((_, index) => index % 3 === 0);
  const middleColumnTiles = discoveryTiles.filter((_, index) => index % 3 === 1);
  const rightColumnTiles = discoveryTiles.filter((_, index) => index % 3 === 2);

  return (
    <div className="discovery-section">
      <section className="discovery-hero" ref={sectionRef}>
        <div className="discovery-hero__content">
          <span className="discovery-hero__subtitle">HARMONY SOUND</span>
          <h1 className="discovery-hero__title">
            Discover Pure <br /> Euphony
          </h1>
          <p className="discovery-hero__description">
            Delve into Harmony Sound&apos;s curated collection, where every product is
            designed for discerning ears. From premium headphones to essential
            accessories, experience the pinnacle of auditory excellence. Your
            symphony of perfection awaits.
          </p>
        </div>

        <div className="discovery-hero__images">
          <div className="discovery-image-grid">
            <div className="discovery-image-column">
              {leftColumnTiles.map((product, index) => (
                  <motion.div
                    className="discovery-image-box"
                    style={{ y: yLeft }}
                    key={`${product.id}-left-${index}`}
                  >
                    <Link
                      to={`/products/${product.slug}`}
                      className="discovery-image-box__link"
                      aria-label={product.name}
                    >
                      <img
                        className="discovery-image-box__image"
                        src={product.images[0]}
                        alt={product.name}
                      />
                    </Link>
                  </motion.div>
                ))}
            </div>

            <div className="discovery-image-column">
              {middleColumnTiles.map((product, index) => (
                  <motion.div
                    className="discovery-image-box"
                    style={{ y: yMiddle }}
                    key={`${product.id}-middle-${index}`}
                  >
                    <Link
                      to={`/products/${product.slug}`}
                      className="discovery-image-box__link"
                      aria-label={product.name}
                    >
                      <img
                        className="discovery-image-box__image"
                        src={product.images[0]}
                        alt={product.name}
                      />
                    </Link>
                  </motion.div>
                ))}
            </div>

            <div className="discovery-image-column">
              {rightColumnTiles.map((product, index) => (
                  <motion.div
                    className="discovery-image-box"
                    style={{ y: yRight }}
                    key={`${product.id}-right-${index}`}
                  >
                    <Link
                      to={`/products/${product.slug}`}
                      className="discovery-image-box__link"
                      aria-label={product.name}
                    >
                      <img
                        className="discovery-image-box__image"
                        src={product.images[0]}
                        alt={product.name}
                      />
                    </Link>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DiscoverySection;
