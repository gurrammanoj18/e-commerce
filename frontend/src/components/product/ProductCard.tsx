import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/product/ProductCard.css";
import "../../styles/shared/LoadingState.css";
import { useCart } from "../../contexts/CartContext";
import { useWishlist } from "../../contexts/WishlistContext";
import { Product } from "../../types/store";
import { formatCurrency } from "../../utils/currency";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, compact = false }) => {
  const { addToCart, items, updateQuantity } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlistPending, setWishlistPending] = useState(false);
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
      ? "Low stock"
      : "In stock";
  const savedToWishlist = isInWishlist(product.id);
  const cartItem = items.find((item) => item.product.id === product.id);
  const cartQuantity = cartItem?.quantity ?? 0;

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await addToCart(product);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = async (quantity: number) => {
    setAddingToCart(true);
    try {
      await updateQuantity(product.id, quantity);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    setWishlistPending(true);
    try {
      await toggleWishlist(product);
    } finally {
      setWishlistPending(false);
    }
  };

  return (
    <article className={`store-card product-card ${compact ? "product-card--compact" : ""}`}>
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
            <span className="product-card__price-row">
              <strong>{formatCurrency(product.price)}</strong>
              <span className="product-card__original-price">{formatCurrency(product.originalPrice)}</span>
            </span>
            <em>Save {product.discountPercentage}%</em>
          </div>
        </div>
        <div className="product-card__highlights">
          <span className={`product-pill product-pill--${product.availability}`}>
            {stockLabel}
          </span>
        </div>
        <div className="product-card__footer">
          {cartQuantity > 0 ? (
            <div className="product-card__quantity-control" aria-label={`${product.name} cart quantity`}>
              <button
                type="button"
                disabled={addingToCart}
                onClick={() => void handleQuantityChange(cartQuantity - 1)}
                aria-label={`Reduce ${product.name} quantity`}
              >
                -
              </button>
              <span>{cartQuantity}</span>
              <button
                type="button"
                disabled={addingToCart}
                onClick={() => void handleQuantityChange(cartQuantity + 1)}
                aria-label={`Increase ${product.name} quantity`}
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={product.availability === "out-of-stock" || addingToCart}
              onClick={() => void handleAddToCart()}
            >
              {product.availability === "out-of-stock" ? "Unavailable" : compact ? "ADD" : "Add to cart"}
            </button>
          )}
          <button
            className="product-card__share"
            type="button"
            disabled={wishlistPending}
            onClick={() => void handleToggleWishlist()}
          >
            {savedToWishlist ? "In wishlist" : "Add to wishlist"}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
