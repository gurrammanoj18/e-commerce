import React from "react";
import { Link } from "react-router-dom";
import QuantitySelector from "../components/product/QuantitySelector";
import { useCart } from "../contexts/CartContext";
import { formatCurrency } from "../utils/currency";

const CartPage: React.FC = () => {
  const { items, removeFromCart, subtotal, updateQuantity } = useCart();
  const shipping = subtotal > 4999 ? 0 : 499;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  if (!items.length) {
    return (
      <section className="shell section page-section">
        <div className="store-card empty-state">
          <h1>Your cart is empty</h1>
          <p>Add products from the catalog to review quantities and pricing.</p>
          <Link className="button" to="/products">
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
                  <QuantitySelector
                    value={item.quantity}
                    onChange={(value) => void updateQuantity(item.product.id, value)}
                  />
                  <strong>{formatCurrency(item.product.price * item.quantity)}</strong>
                  <button
                    className="link-button"
                    type="button"
                    onClick={() => void removeFromCart(item.product.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="store-card summary-card">
          <h2>Order summary</h2>
          <div>
            <span>Subtotal</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </div>
          <div>
            <span>Shipping</span>
            <strong>{shipping === 0 ? "Free" : formatCurrency(shipping)}</strong>
          </div>
          <div>
            <span>Estimated tax</span>
            <strong>{formatCurrency(tax)}</strong>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
          <Link className="button" to="/checkout">
            Proceed to checkout
          </Link>
        </aside>
      </div>
    </section>
  );
};

export default CartPage;
