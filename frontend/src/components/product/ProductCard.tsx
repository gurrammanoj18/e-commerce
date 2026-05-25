import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/product/ProductCard.css";
import { useCart } from "../../contexts/CartContext";
import { useWishlist } from "../../contexts/WishlistContext";
import { Product } from "../../types/store";
import { formatCurrency } from "../../utils/currency";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [hoverDirection, setHoverDirection] = useState<"left" | "right" | null>(
    null
  );

  const previewImages = useMemo(() => {
    const fallbackImage = product.images[0];
    return {
      left: product.images[1] || product.images[0] || fallbackImage,
      right: product.images[2] || product.images[1] || product.images[0] || fallbackImage,
    };
  }, [product.images]);

  const handleMouseMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const pointerX = event.clientX - bounds.left;

    if (pointerX < bounds.width / 3) {
      setHoverDirection("left");
      return;
    }

    if (pointerX > (bounds.width * 2) / 3) {
      setHoverDirection("right");
      return;
    }

    setHoverDirection(null);
  };

  const stockLabel =
    product.availability === "out-of-stock"
      ? "Out of stock"
      : product.availability === "low-stock"
      ? `Low stock · ${product.stockQuantity} left`
      : `In stock · ${product.stockQuantity} available`;
  const savedToWishlist = isInWishlist(product.id);

  return (
    <article className="store-card product-card">
      <Link
        className="product-card__media"
        to={`/products/${product.slug}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverDirection(null)}
      >
        <div className="product-card__image-stage">
          <img
            className={`product-card__image product-card__image--base ${
              hoverDirection === "left"
                ? "is-leaving-right"
                : hoverDirection === "right"
                ? "is-leaving-left"
                : ""
            }`}
            src={product.images[0]}
            alt={product.name}
          />
          <img
            className={`product-card__image product-card__image--left ${
              hoverDirection === "left" ? "is-active" : ""
            }`}
            src={previewImages.left}
            alt={`${product.name} alternate left view`}
          />
          <img
            className={`product-card__image product-card__image--right ${
              hoverDirection === "right" ? "is-active" : ""
            }`}
            src={previewImages.right}
            alt={`${product.name} alternate right view`}
          />
        </div>
        <div className="product-card__hover-zones" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className="product-card__discount-badge">
          {product.discountPercentage}% OFF
        </span>
        <span className="badge">{product.badge}</span>
      </Link>

      <div className="product-card__content">
        <div className="product-card__meta">
          <span>{product.brand}</span>
          <span>
            ⭐ {product.rating} · {product.reviewCount}
          </span>
        </div>

        <Link className="product-card__title" to={`/products/${product.slug}`}>
          {product.name}
        </Link>
        <p className="product-card__copy">{product.shortDescription}</p>

        <div className="product-card__pricing">
          <div>
            <strong>{formatCurrency(product.price)}</strong>
            <span>{formatCurrency(product.originalPrice)}</span>
          </div>
        </div>

        <div className="product-card__highlights">
          <span className={`product-pill product-pill--${product.availability}`}>
            {stockLabel}
          </span>
          <span className="product-pill">
            Warranty: {product.warrantyAvailable ? "Available" : "Not listed"}
          </span>
          <span className="product-pill">
            Replacement: {product.replacementAvailable ? "Available" : "Unavailable"}
          </span>
        </div>

        <div className="product-card__specs">
          {product.specs.slice(0, 3).map((spec) => (
            <div key={spec.label}>
              <strong>{spec.value}</strong>
              <span>{spec.label}</span>
            </div>
          ))}
        </div>

        <div className="product-card__footer">
          <button
            type="button"
            disabled={product.availability === "out-of-stock"}
            onClick={() => void addToCart(product)}
          >
            {product.availability === "out-of-stock" ? "Unavailable" : "Add to cart"}
          </button>
          <button
            className="product-card__share"
            type="button"
            onClick={() => void toggleWishlist(product)}
          >
            {savedToWishlist ? "In wishlist" : "Add to wishlist"}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
