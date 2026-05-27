import React, { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "../styles/pages/ProductDetailsPage.css";
import ProductGallery from "../components/product/ProductGallery";
import ProductCard from "../components/product/ProductCard";
import QuantitySelector from "../components/product/QuantitySelector";
import LoadingState from "../components/shared/LoadingState";
import { useCart } from "../contexts/CartContext";
import { useCollectionAnimation } from "../contexts/CollectionAnimationContext";
import { useProducts } from "../contexts/ProductContext";
import { useWishlist } from "../contexts/WishlistContext";
import { Product } from "../types/store";
import { formatCurrency } from "../utils/currency";

const ProductDetailsPage: React.FC = () => {
  const { slug = "" } = useParams();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { animateProductToTarget } = useCollectionAnimation();
  const { getProductBySlug, getRelatedProducts, loading } = useProducts();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [resolved, setResolved] = useState(false);
  const heroImageRef = useRef<HTMLImageElement | null>(null);

  React.useEffect(() => {
    const loadProduct = async () => {
      const resolvedProduct = await getProductBySlug(slug);
      setProduct(resolvedProduct || null);
      setResolved(true);
    };
    void loadProduct();
  }, [getProductBySlug, slug]);

  if (loading || !resolved) {
    return (
      <section className="shell section page-section">
        <LoadingState cardCount={2} />
      </section>
    );
  }

  if (!product) {
    return (
      <section className="shell section page-section">
        <div className="store-card empty-state">
          <h2>Product not found</h2>
          <p>The item you were looking for is no longer available in the catalog.</p>
          <Link className="button" to="/products">
            Return to products
          </Link>
        </div>
      </section>
    );
  }

  const relatedProducts = getRelatedProducts(product);
  const savedToWishlist = isInWishlist(product.id);

  const animateProduct = async (target: "cart" | "wishlist") => {
    if (!product.images[0] || !heroImageRef.current) {
      return;
    }

    await animateProductToTarget({
      imageSrc: product.images[0],
      sourceRect: heroImageRef.current.getBoundingClientRect(),
      target,
    });
  };

  return (
    <section className="shell section page-section">
      <div className="details-layout">
        <ProductGallery images={product.images} alt={product.name} heroImageRef={heroImageRef} />

        <div className="store-card details-panel">
          <h1>{product.name}</h1>
          <div className="details-rating">
            <span>⭐ {product.rating}</span>
            <span>{product.reviewCount} verified reviews</span>
            <span>
              {product.availability === "out-of-stock"
                ? "Out of stock"
                : product.availability === "low-stock"
                ? "Low stock"
                : "In stock"}
            </span>
          </div>

          <div className="details-price">
            <strong>{formatCurrency(product.price)}</strong>
            <span>{formatCurrency(product.originalPrice)}</span>
          </div>

          <div className="details-purchase">
            <QuantitySelector value={quantity} onChange={setQuantity} />
            <button
              type="button"
              className="details-action-button details-action-button--primary"
              onClick={() =>
                void (async () => {
                  await animateProduct("cart");
                  await addToCart(product, quantity);
                })()
              }
            >
              <span aria-hidden="true">🛒</span>
              <span>Add to cart</span>
            </button>
            <button
              type="button"
              className="details-action-button details-action-button--secondary"
              onClick={() =>
                void (async () => {
                  if (!savedToWishlist) {
                    await animateProduct("wishlist");
                  }
                  await toggleWishlist(product);
                })()
              }
            >
              <span aria-hidden="true">{savedToWishlist ? "♥" : "♡"}</span>
              <span>{savedToWishlist ? "Wishlisted" : "Wishlist"}</span>
            </button>
          </div>

          <div className="details-support">
            <div>
              <span>Warranty</span>
              <strong>{product.warrantyAvailable ? "Available" : "Not listed"}</strong>
            </div>
            <div>
              <span>Replacement</span>
              <strong>{product.replacementAvailable ? "Available" : "Unavailable"}</strong>
            </div>
          </div>

          <div className="details-description">
            <span className="eyebrow">Description</span>
            <p>{product.description}</p>
          </div>
        </div>
      </div>

      <div className="section-heading">
        <div>
          <span className="eyebrow">Related products</span>
          <h2>More in {product.category}</h2>
        </div>
      </div>
      <div className="product-grid">
        {relatedProducts.map((relatedProduct) => (
          <ProductCard key={relatedProduct.id} product={relatedProduct} />
        ))}
      </div>
    </section>
  );
};

export default ProductDetailsPage;
