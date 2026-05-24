import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  return (
    <section className="shell section page-section">
      <div className="store-card empty-state">
        <span className="eyebrow">404</span>
        <h1>Page not found</h1>
        <p>The page you requested doesn’t exist in this storefront.</p>
        <Link className="button" to="/">
          Return home
        </Link>
      </div>
    </section>
  );
};

export default NotFoundPage;
