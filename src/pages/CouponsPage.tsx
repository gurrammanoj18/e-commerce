import React from "react";
import { Link } from "react-router-dom";
import "../styles/pages/OrdersPage.css";

const CouponsPage: React.FC = () => {
  return (
    <section className="shell section page-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Account</span>
          <h1>Your coupons</h1>
        </div>
      </div>

      <div className="orders-list">
        <article className="store-card order-card">
          <div className="order-card__header">
            <div>
              <span>Saved offers</span>
              <h2>No active coupons yet</h2>
            </div>
          </div>
          <p className="order-card__copy">
            Promotional coupons, loyalty rewards, and seasonal offers linked to your account
            will appear here after login.
          </p>
          <Link className="button" to="/products?discover=1">
            Explore deals
          </Link>
        </article>
      </div>
    </section>
  );
};

export default CouponsPage;
