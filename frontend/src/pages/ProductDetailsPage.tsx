import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import "../styles/pages/ProductDetailsPage.css";
import ProductGallery from "../components/product/ProductGallery";
import ProductCard from "../components/product/ProductCard";
import QuantitySelector from "../components/product/QuantitySelector";
import LoadingState from "../components/shared/LoadingState";
import { useCart } from "../contexts/CartContext";
import { useProducts } from "../contexts/ProductContext";
import { useWishlist } from "../contexts/WishlistContext";
import { Product } from "../types/store";
import { formatCurrency } from "../utils/currency";

const splitParagraphs = (value: string) =>
  value
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

const ProductDetailsPage: React.FC = () => {
  const { slug = "" } = useParams();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { getProductBySlug, getRelatedProducts, loading } = useProducts();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [resolved, setResolved] = useState(false);

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
      <section className="shell section page-section details-page">
        <LoadingState cardCount={2} />
      </section>
    );
  }

  if (!product) {
    return (
      <section className="shell section page-section details-page">
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
  const discountLabel = `${product.discountPercentage}% OFF`;
  const descriptionParagraphs = splitParagraphs(product.description || product.shortDescription || "");
  const detailTags = [
    product.category,
    product.subcategory,
    product.badge,
    product.heroTag,
    product.warrantyAvailable ? "Warranty available" : "Warranty not listed",
    product.replacementAvailable ? "Replacement available" : "Replacement not listed",
  ].filter(Boolean);

  return (
    <section className="shell section page-section details-page">
      <div className="details-layout">
        <div className="details-gallery-wrap">
          <span className="details-badge">{discountLabel}</span>
          <ProductGallery images={product.images} alt={product.name} />
          <div className="details-gallery-actions">
            <button
              type="button"
              className="details-gallery-action"
              onClick={() => {
                const shareUrl = window.location.href;
                void navigator.share?.({
                  title: product.name,
                  text: `Check out ${product.name} on Eldoo`,
                  url: shareUrl,
                });
              }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 5v14M12 5l-5 5M12 5l5 5M6 19h12" />
              </svg>
            </button>
            <button
              type="button"
              className={`details-gallery-action details-gallery-action--wishlist ${
                savedToWishlist ? "is-active" : ""
              }`}
              onClick={() => void toggleWishlist(product)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 21s-7-4.4-7-10.2C5 7.4 6.9 6 9.1 6c1.4 0 2.5.7 2.9 1.5.4-.8 1.5-1.5 2.9-1.5 2.2 0 4.1 1.4 4.1 4.8C19 16.6 12 21 12 21Z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="store-card details-panel">
          <div className="details-panel__scroll">
            <div className="details-brand">Brand: {product.brand}</div>
            <h1>{product.name}</h1>

            <div className="details-meta-tags" aria-label="Product attributes">
              {detailTags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>

            <div className="details-price-stack">
              <div className="details-price">
                <strong>{formatCurrency(product.price)}</strong>
                <span>{formatCurrency(product.originalPrice)}</span>
              </div>
              <div className="details-offer-line">{discountLabel}</div>
            </div>

            <div className="details-hero-tag">
              <span>{product.heroTag}</span>
            </div>

            <div className="details-purchase">
              <QuantitySelector value={quantity} onChange={setQuantity} />
              <button
                type="button"
                className="details-action-button details-action-button--primary"
                onClick={() => void addToCart(product, quantity)}
              >
                <span aria-hidden="true">🛒</span>
                <span>Add to cart</span>
              </button>
            </div>

            <div className="details-trust-grid" aria-label="Secure purchase highlights">
              <div className="details-trust-item">
                <span className="details-trust-item__icon" aria-hidden="true">
                  ✓
                </span>
                <div>
                  <strong>Secure payments</strong>
                  <span>Encrypted checkout</span>
                </div>
              </div>
              <div className="details-trust-item">
                <span className="details-trust-item__icon" aria-hidden="true">
                  ⟲
                </span>
                <div>
                  <strong>Warranty support</strong>
                  <span>{product.warrantyAvailable ? "Available" : "Not listed"}</span>
                </div>
              </div>
              <div className="details-trust-item">
                <span className="details-trust-item__icon" aria-hidden="true">
                  ❤
                </span>
                <div>
                  <strong>Genuine products</strong>
                  <span>Verified inventory</span>
                </div>
              </div>
              <div className="details-trust-item">
                <span className="details-trust-item__icon" aria-hidden="true">
                  ☎
                </span>
                <div>
                  <strong>Support available</strong>
                  <span>Call or chat anytime</span>
                </div>
              </div>
            </div>

            <div className="details-copy-stack">
              <div className="details-copy-block">
                <h2>About this product</h2>
                {descriptionParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <div className="details-copy-block">
                <h2>Quick summary</h2>
                <p>{product.shortDescription}</p>
              </div>

              <div className="details-copy-block">
                <h2>Product tags</h2>
                <div className="details-tag-list">
                  {product.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
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
