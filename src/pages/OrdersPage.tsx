import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchOrders } from "../services/orderService";
import "../styles/pages/OrdersPage.css";
import { Order } from "../types/store";
import { formatCurrency } from "../utils/currency";

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await fetchOrders();
        setOrders(response);
      } catch {
        setError("Unable to load your order history right now.");
      } finally {
        setLoading(false);
      }
    };

    void loadOrders();
  }, []);

  if (loading) {
    return (
      <section className="shell section page-section">
        <div className="store-card empty-state">
          <h1>Loading your orders...</h1>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="shell section page-section">
        <div className="store-card empty-state">
          <h1>Order history unavailable</h1>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  if (!orders.length) {
    return (
      <section className="shell section page-section">
        <div className="store-card empty-state">
          <h1>No orders yet</h1>
          <p>Your future purchases will show up here with status and item details.</p>
          <Link className="button" to="/products">
            Start shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="shell section page-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Account</span>
          <h1>Your order history</h1>
        </div>
      </div>

      <div className="orders-list">
        {orders.map((order) => (
          <article className="store-card order-card" key={order.id}>
            <div className="order-card__header">
              <div>
                <span>Order #{order.orderNumber.slice(0, 8)}</span>
                <h2>{order.status}</h2>
              </div>
              <strong>{formatCurrency(order.totalAmount)}</strong>
            </div>
            <div className="order-card__meta">
              <span>{new Date(order.createdAt).toLocaleString()}</span>
              <span>
                {order.deliveryMode === "STORE_PICKUP" ? "Pick up at store" : "Home delivery"}
              </span>
              <span>{order.deliverySlot || "Standard slot"}</span>
              {order.priorityOrder ? <span>Priority order</span> : null}
              <span>{order.city}</span>
              <span>{order.items.length} item(s)</span>
            </div>
            <div className="order-card__items">
              {order.items.map((item) => (
                <div key={`${order.id}-${item.productSlug}`} className="order-card__item">
                  <img src={item.image} alt={item.productName} />
                  <div className="order-card__item-content">
                    <strong>{item.productName}</strong>
                    <span className="order-card__item-price">
                      {item.quantity} x {formatCurrency(item.unitPrice)}
                    </span>
                    <span className="order-card__item-status">Status: {order.status}</span>
                    <span className="order-card__item-rating" aria-label="5 star review">
                      ★★★★★
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default OrdersPage;
