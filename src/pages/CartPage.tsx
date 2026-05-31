import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/pages/CartPage.css";
import { toast } from "react-toastify";
import QuantitySelector from "../components/product/QuantitySelector";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import {
  addSavedForLaterItem,
  fetchSavedForLater,
  removeSavedForLaterItem,
} from "../services/saveForLaterService";
import { SaveForLaterItem } from "../types/store";
import { formatCurrency } from "../utils/currency";

const CartPage: React.FC = () => {
  const { user } = useAuth();
  const { addToCart, items, removeFromCart, subtotal, updateQuantity } = useCart();
  const [savedItems, setSavedItems] = useState<SaveForLaterItem[]>([]);
  const shipping =
    user?.preferredDeliveryMode === "STORE_PICKUP"
      ? 0
      : subtotal > 4999
        ? 0
        : 499;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  const loadSavedItems = async () => {
    try {
      const response = await fetchSavedForLater();
      setSavedItems(response.items);
    } catch {
      setSavedItems([]);
    }
  };

  useEffect(() => {
    void loadSavedItems();
  }, []);

  const handleSaveForLater = async (productId: number, quantity: number) => {
    try {
      await addSavedForLaterItem(productId, quantity);
      await removeFromCart(productId);
      await loadSavedItems();
      toast.success("Moved to save for later");
    } catch {
      toast.error("Couldn't save this item for later.");
    }
  };

  const handleMoveToCart = async (savedItem: SaveForLaterItem) => {
    try {
      await addToCart(savedItem.product, savedItem.quantity);
      await removeSavedForLaterItem(savedItem.id);
      await loadSavedItems();
      toast.success("Moved back to cart");
    } catch {
      toast.error("Couldn't move this item back to cart.");
    }
  };

  if (!items.length && !savedItems.length) {
    return (
      <section className="shell section page-section">
        <div className="store-card empty-state">
          <h1>Your cart is empty</h1>
          <p>Add products from the catalog to review quantities and pricing.</p>
          <Link className="button" to="/">
            Continue shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="shell section page-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Shopping cart</span>
          <h1>Review your selected gear</h1>
        </div>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {items.length ? (
            items.map((item) => (
              <article className="store-card cart-item" key={item.product.id}>
                <img src={item.product.images[0]} alt={item.product.name} />
                <div className="cart-item__content">
                  <div className="cart-item__details">
                    <span>{item.product.brand}</span>
                    <h3>{item.product.name}</h3>
                    <p>{item.product.shortDescription}</p>
                  </div>
                  <div className="cart-item__meta">
                    <QuantitySelector
                      value={item.quantity}
                      onChange={(value) => void updateQuantity(item.product.id, value)}
                    />
                    <strong className="cart-item__price">
                      {formatCurrency(item.product.price * item.quantity)}
                    </strong>
                    <div className="cart-item__actions">
                      <button
                        className="link-button"
                        type="button"
                        onClick={() => void handleSaveForLater(item.product.id, item.quantity)}
                      >
                        Save for later
                      </button>
                      <button
                        className="link-button"
                        type="button"
                        onClick={() => void removeFromCart(item.product.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="store-card empty-state">
              <h2>Your active cart is empty</h2>
              <p>Saved items are waiting below when you're ready.</p>
            </div>
          )}

          {savedItems.length ? (
            <section className="store-card cart-saved-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">Saved for later</span>
                  <h2>Items parked for a future order</h2>
                </div>
              </div>
              <div className="cart-items">
                {savedItems.map((item) => (
                  <article className="cart-item" key={item.id}>
                    <img src={item.product.images[0]} alt={item.product.name} />
                    <div className="cart-item__content">
                      <div className="cart-item__details">
                        <span>{item.product.brand}</span>
                        <h3>{item.product.name}</h3>
                        <p>Saved quantity: {item.quantity}</p>
                      </div>
                      <div className="cart-item__meta">
                        <strong className="cart-item__price">
                          {formatCurrency(item.product.price * item.quantity)}
                        </strong>
                        <div className="cart-item__actions">
                          <button
                            className="link-button"
                            type="button"
                            onClick={() => void handleMoveToCart(item)}
                          >
                            Move to cart
                          </button>
                          <button
                            className="link-button"
                            type="button"
                            onClick={async () => {
                              await removeSavedForLaterItem(item.id);
                              await loadSavedItems();
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="store-card summary-card">
          <h2>Order summary</h2>
          <div>
            <span>Subtotal</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </div>
          <div>
            <span>Shipping</span>
            <strong>
              {user?.preferredDeliveryMode === "STORE_PICKUP"
                ? "Store pickup"
                : shipping === 0
                  ? "Free"
                  : formatCurrency(shipping)}
            </strong>
          </div>
          <div>
            <span>Estimated tax</span>
            <strong>{formatCurrency(tax)}</strong>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
          {items.length ? (
            <Link className="button" to="/checkout">
              Proceed to checkout
            </Link>
          ) : null}
        </aside>
      </div>
    </section>
  );
};

export default CartPage;
