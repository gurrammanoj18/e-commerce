import React, { useEffect, useMemo, useRef, useState } from "react";
import "../../styles/components/ProductGrid.css";
import { getBestSellerProducts } from "../../services/productService";
import { Product } from "../../types/store";
import { formatCurrency } from "../../utils/currency";

const MOBILE_PAGE_SIZE = 5;

const ProductGrid: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [slideIndices, setSlideIndices] = useState<{ [key: number]: number }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const bestSellers = await getBestSellerProducts();
        setProducts(bestSellers);
        setSlideIndices(Object.fromEntries(bestSellers.map((product) => [product.id, 0])));
      } catch {
        setProducts([]);
      }
    };

    void loadProducts();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 820);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const productsPerPage = isMobile ? MOBILE_PAGE_SIZE : 12;
  const totalPages = Math.max(1, Math.ceil(products.length / productsPerPage));
  const currentProducts = useMemo(
    () => products.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage),
    [currentPage, products, productsPerPage],
  );

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const handleMouseMove = (e: React.MouseEvent, id: number, imageCount: number) => {
    if (imageCount <= 1) {
      return;
    }

    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;

    setSlideIndices((prev) => ({
      ...prev,
      [id]:
        x < width / 3 ? 0 : x > (2 * width) / 3 ? Math.min(2, imageCount - 1) : Math.min(1, imageCount - 1),
    }));
  };

  const handleMouseLeave = (id: number) => {
    setSlideIndices((prev) => ({ ...prev, [id]: 0 }));
  };

  const goPrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null || !isMobile) {
      return;
    }

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const deltaX = touchEndX - touchStartX.current;
    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) {
        goNext();
      } else {
        goPrev();
      }
    }
    touchStartX.current = null;
  };

  return (
    <div>
      <section
        className={`product-grid ${isMobile ? "product-grid--mobile-swipe" : ""}`}
        ref={gridRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {currentProducts.map((product) => (
          <div
            key={product.id}
            className="product-card"
            onMouseMove={(e) => handleMouseMove(e, product.id, product.images.length)}
            onMouseLeave={() => handleMouseLeave(product.id)}
          >
            <div className="product-img-slider">
              <div
                className="product-img-track"
                style={{
                  transform: `translateX(-${(slideIndices[product.id] || 0) * 100}%)`,
                  transition: "transform 0.4s ease",
                }}
              >
                {(product.images.length ? product.images : [""]).map((img, i) => (
                  <img className="product-image" key={i} src={img} alt={product.name} />
                ))}
              </div>
              <span className="rating">⭐ {product.rating}</span>
            </div>

            <div className="product-info">
              <p className="brand">{product.brand}</p>
              <div className="name-price-div">
                <h3 className="name">{product.name}</h3>
                <p className="price">{formatCurrency(product.price)}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="pagination">
        <button onClick={goPrev} disabled={currentPage === 1}>
          ⬅ Prev
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={goNext} disabled={currentPage === totalPages}>
          Next ➡
        </button>
      </div>
    </div>
  );
};

export default ProductGrid;
