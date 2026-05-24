import React, { useState } from "react";
import { toast } from "react-toastify";
import { useCart } from "../contexts/CartContext";
import { checkout } from "../services/orderService";
import { Order } from "../types/store";
import { formatCurrency } from "../utils/currency";

const CheckoutPage: React.FC = () => {
  const { clearCart, items, subtotal } = useCart();
  const [formState, setFormState] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const shipping = subtotal > 4999 ? 0 : 499;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormState((currentState) => ({ ...currentState, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const isValid = Object.values(formState).every((value) => value.trim());
    if (!isValid) {
      return;
    }
    const order = await checkout({
      shippingName: formState.fullName,
      email: formState.email,
      phone: formState.phone,
      shippingAddress: formState.address,
      city: formState.city,
      postalCode: formState.postalCode,
    });
    setPlacedOrder(order);
    clearCart();
    setSubmitted(true);
    toast.success("Order placed successfully");
  };

  return (
    <section className="shell section page-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Checkout</span>
          <h1>Shipping and payment</h1>
        </div>
      </div>

      {submitted ? (
        <div className="store-card empty-state">
          <h2>Order placed successfully</h2>
          <p>
            Thanks {placedOrder?.shippingName}. Your order ID is #{placedOrder?.id}
            and WhatsApp updates will be sent to {placedOrder?.phone}.
          </p>
        </div>
      ) : (
        <div className="checkout-layout">
          <form className="store-card form-card" onSubmit={handleSubmit}>
            <h2>Shipping details</h2>
            <div className="form-grid">
              <label>
                Full name
                <input name="fullName" value={formState.fullName} onChange={handleChange} />
              </label>
              <label>
                Email
                <input name="email" type="email" value={formState.email} onChange={handleChange} />
              </label>
              <label>
                Phone
                <input name="phone" value={formState.phone} onChange={handleChange} />
              </label>
              <label>
                City
                <input name="city" value={formState.city} onChange={handleChange} />
              </label>
              <label>
                Postal code
                <input name="postalCode" value={formState.postalCode} onChange={handleChange} />
              </label>
              <label className="form-grid__wide">
                Address
                <textarea name="address" rows={4} value={formState.address} onChange={handleChange} />
              </label>
            </div>
            <div className="payment-placeholder">
              <h3>Payment section</h3>
              <p>
                Reserve this block for Razorpay, Stripe, COD, or your preferred
                payment gateway integration.
              </p>
            </div>
            <button className="button" type="submit">
              Confirm order
            </button>
          </form>

          <aside className="store-card summary-card">
            <h2>Order summary</h2>
            {items.map((item) => (
              <div key={item.product.id}>
                <span>
                  {item.product.name} × {item.quantity}
                </span>
                <strong>{formatCurrency(item.product.price * item.quantity)}</strong>
              </div>
            ))}
            <div>
              <span>Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
            <div>
              <span>Shipping</span>
              <strong>{shipping === 0 ? "Free" : formatCurrency(shipping)}</strong>
            </div>
            <div>
              <span>Tax</span>
              <strong>{formatCurrency(tax)}</strong>
            </div>
            <div className="summary-total">
              <span>Payable now</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
};

export default CheckoutPage;
