import React, { useEffect, useMemo, useState } from "react";
import "../../styles/product/ProductGallery.css";

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ images, alt }) => {
  const galleryImages = useMemo(() => images.filter(Boolean), [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    setActiveIndex(0);
  }, [galleryImages]);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) {
      return;
    }

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
    const deltaX = touchEndX - touchStartX;

    if (Math.abs(deltaX) > 45) {
      setActiveIndex((currentIndex) => {
        if (deltaX < 0) {
          return Math.min(currentIndex + 1, galleryImages.length - 1);
        }

        return Math.max(currentIndex - 1, 0);
      });
    }

    setTouchStartX(null);
  };

  return (
    <div className="product-gallery">
      <div
        className="product-gallery__hero"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="product-gallery__track"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {galleryImages.map((image, index) => (
            <div key={`${image}-${index}`} className="product-gallery__slide">
              <img src={image} alt={alt} />
            </div>
          ))}
        </div>
      </div>
      <div className="product-gallery__thumbs">
        {galleryImages.map((image, index) => (
          <button
            key={image}
            type="button"
            className={activeIndex === index ? "is-active" : ""}
            onClick={() => setActiveIndex(index)}
          >
            <img src={image} alt={alt} />
          </button>
        ))}
      </div>
      <div className="product-gallery__dots" aria-hidden="true">
        {galleryImages.map((image, index) => (
          <button
            key={`${image}-dot`}
            type="button"
            className={activeIndex === index ? "is-active" : ""}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;
