import React, { useState, useRef } from "react";
import "../../styles/components/ProductGrid.css";

// images
import p1Image from "../../product-grid-assets/p4.webp";
import p2Image from "../../product-grid-assets/p2.webp";
import p3Image from "../../product-grid-assets/p3.webp";
import p4Image from "../../product-grid-assets/p4.webp";

import product1image1 from "../../assets/imagesP1/p1.webp";
import product1image2 from "../../assets/imagesP1/p11.jpg";
import product1image3 from "../../assets/imagesP1/p12.webp";
import product1image4 from "../../assets/imagesP1/p13.webp";

import product2image1 from "../../assets/imagesP2/p3.webp";
import product2image2 from "../../assets/imagesP2/p21.webp";
import product2image3 from "../../assets/imagesP2/p22.webp";
import product2image4 from "../../assets/imagesP2/p23.jpg";

interface Product {
  id: number;
  brand: string;
  name: string;
  price: string;
  rating: number;
  images: string[];
  specs: {
    driver: string;
    weight: string;
    battery: string;
  };
}

const airBeats: Omit<Product, "id"> = {
  brand: "SONICPULSE",
  name: "Air Beats",
  price: "Rs. 45,000.00",
  rating: 5.0,
  images: [product1image2, product1image1, product1image3, product1image4],
  specs: { driver: "40mm", weight: "285 g", battery: "35h" },
};

const oasisFlow: Omit<Product, "id"> = {
  brand: "RESONANCE",
  name: "Oasis Flow",
  price: "Rs. 27,100.00",
  rating: 5.0,
  images: [product2image2, product2image1, product2image3, product2image4],
  specs: { driver: "40mm", weight: "244 g", battery: "19h" },
};

const products: Product[] = Array.from({ length: 28 }, (_, i) => {
  const isAirBeats = i % 2 === 0;
  return {
    id: i + 1,
    ...(isAirBeats ? airBeats : oasisFlow),
    images:
      i % 3 === 0
        ? [p1Image, p3Image, p4Image]
        : isAirBeats
        ? airBeats.images
        : [p2Image, p4Image, p1Image],
  };
});

const ProductGrid: React.FC = () => {
  const [slideIndices, setSlideIndices] = useState<{ [key: number]: number }>(
    () => Object.fromEntries(products.map((p) => [p.id, 1]))
  );
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;
  const totalPages = Math.ceil(products.length / productsPerPage);

  const gridRef = useRef<HTMLDivElement>(null);

  const currentProducts = products.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const handleMouseMove = (e: React.MouseEvent, id: number) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;

    setSlideIndices((prev) => ({
      ...prev,
      [id]: x < width / 3 ? 0 : x > (2 * width) / 3 ? 2 : 1,
    }));
  };

  const handleMouseLeave = (id: number) => {
    setSlideIndices((prev) => ({ ...prev, [id]: 1 }));
  };

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      <section className="product-grid" ref={gridRef}>
        {currentProducts.map((p) => (
          <div
            key={p.id}
            className="product-card"
            onMouseMove={(e) => handleMouseMove(e, p.id)}
            onMouseLeave={() => handleMouseLeave(p.id)}
          >
            <div className="product-img-slider">
              <div
                className="product-img-track"
                style={{
                  transform: `translateX(-${slideIndices[p.id] * 100}%)`,
                  transition: "transform 0.4s ease",
                }}
              >
                {p.images.map((img, i) => (
                  <img className="product-image" key={i} src={img} alt="" />
                ))}
              </div>
              <span className="rating">⭐ {p.rating}</span>
            </div>

            <div className="product-info">
              <p className="brand">{p.brand}</p>
              <div className="name-price-div">
                <h3 className="name">{p.name}</h3>
                <p className="price">{p.price}</p>
              </div>
            </div>

            <div className="product-specs">
              <div className="icon-container">
                <span className="icon">🎧</span>
                <p>
                  {p.specs.driver}
                  <br />
                  <small>Driver size</small>
                </p>
              </div>
              <div className="icon-container">
                <span className="icon">⚖️</span>
                <p>
                  {p.specs.weight}
                  <br />
                  <small>Product weight</small>
                </p>
              </div>
              <div className="icon-container">
                <span className="icon">🔋</span>
                <p>
                  {p.specs.battery}
                  <br />
                  <small>Battery life</small>
                </p>
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="pagination">
        <button onClick={handlePrev} disabled={currentPage === 1}>
          ⬅ Prev
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={handleNext} disabled={currentPage === totalPages}>
          Next ➡
        </button>
      </div>
    </div>
  );
};

export default ProductGrid;
