import React, { useState } from "react";
import "../../styles/product/ProductGallery.css";

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ images, alt }) => {
  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div className="product-gallery">
      <div className="product-gallery__hero">
        <img src={activeImage} alt={alt} />
      </div>
      <div className="product-gallery__thumbs">
        {images.map((image) => (
          <button
            key={image}
            type="button"
            className={activeImage === image ? "is-active" : ""}
            onClick={() => setActiveImage(image)}
          >
            <img src={image} alt={alt} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;
