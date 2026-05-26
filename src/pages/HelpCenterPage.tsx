import React from "react";
import { Link } from "react-router-dom";
import "../styles/pages/OrdersPage.css";

const HelpCenterPage: React.FC = () => {
  return (
    <section className="shell section page-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Account</span>
          <h1>Help center</h1>
        </div>
      </div>

      <div className="orders-list">
        <article className="store-card order-card">
          <div className="order-card__header">
            <div>
              <span>Support</span>
              <h2>Need help with your account or orders?</h2>
            </div>
          </div>
          <p className="order-card__copy">
            Visit support for delivery updates, return questions, payment help, and account
            assistance.
          </p>
          <div className="order-card__actions">
            <Link className="button" to="/contact">
              Contact support
            </Link>
            <Link className="link-button" to="/bulk-order">
              Bulk order help
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
};

export default HelpCenterPage;
