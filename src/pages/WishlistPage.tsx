import React from "react";
import { Link } from "react-router-dom";
import "../styles/pages/CartPage.css";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import { formatCurrency } from "../utils/currency";

const WishlistPage: React.FC = () => {
  const { addToCart } = useCart();
  const { items, removeFromWishlist } = useWishlist();

  const handleMoveToCart = async (productId: number) => {
    const item = items.find((wishlistItem) => wishlistItem.product.id === productId);
    if (!item) {
      return;
    }

    await addToCart(item.product);
    await removeFromWishlist(productId);
  };

  if (!items.length) {
    return (
      <section className="shell section page-section">
        <div className="store-card empty-state">
          <h1>Your wishlist is empty</h1>
          <p>Save products here so you can revisit and compare them later.</p>
          <Link className="button" to="/products?discover=1">
            Explore products
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="shell section page-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Wishlist</span>
          <h1>Saved products for later</h1>
        </div>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <article className="store-card cart-item" key={item.product.id}>
              <img src={item.product.images[0]} alt={item.product.name} />
              <div className="cart-item__content">
                <div>
                  <span>{item.product.brand}</span>
                  <h3>{item.product.name}</h3>
                  <p>{item.product.shortDescription}</p>
                </div>
                <div className="cart-item__meta">
                  <strong>{formatCurrency(item.product.price)}</strong>
                  <button
                    className="button"
                    type="button"
                    onClick={() => void handleMoveToCart(item.product.id)}
                  >
                    Add to cart
                  </button>
                  <button
                    className="link-button"
                    type="button"
                    onClick={() => void removeFromWishlist(item.product.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="store-card summary-card">
          <h2>Wishlist summary</h2>
          <div>
            <span>Saved products</span>
            <strong>{items.length}</strong>
          </div>
          <div>
            <span>In stock now</span>
            <strong>
              {items.filter((item) => item.product.availability !== "out-of-stock").length}
            </strong>
          </div>
          <div className="summary-total">
            <span>Potential spend</span>
            <strong>
              {formatCurrency(
                items.reduce((total, item) => total + item.product.price, 0),
              )}
            </strong>
          </div>
          <Link className="button" to="/products?discover=1">
            Continue browsing
          </Link>
        </aside>
      </div>
    </section>
  );
};

export default WishlistPage;
