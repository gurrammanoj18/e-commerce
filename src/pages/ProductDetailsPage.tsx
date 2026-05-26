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

  return (
    <section className="shell section page-section">
      <div className="details-layout">
        <ProductGallery images={product.images} alt={product.name} />

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
          <p>{product.description}</p>

          <div className="details-price">
            <strong>{formatCurrency(product.price)}</strong>
            <span>{formatCurrency(product.originalPrice)}</span>
          </div>

          <div className="details-purchase">
            <QuantitySelector value={quantity} onChange={setQuantity} />
            <button type="button" onClick={() => void addToCart(product, quantity)}>
              Add to cart
            </button>
            <button type="button" onClick={() => void toggleWishlist(product)}>
              {isInWishlist(product.id) ? "Remove from wishlist" : "Save to wishlist"}
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

          <div className="spec-list">
            {product.specs.map((spec) => (
              <div key={spec.label}>
                <span>{spec.label}</span>
                <strong>{spec.value}</strong>
              </div>
            ))}
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
