import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <h3>VoltMart</h3>
          <p>
            Reliable hardware, business electronics, and high-performance gear
            curated for builders, teams, and enthusiasts.
          </p>
        </div>

        <div>
          <h4>Explore</h4>
          <Link to="/products">All Products</Link>
          <Link to="/bulk-order">Bulk Orders</Link>
          <Link to="/contact">Support</Link>
        </div>

        <div>
          <h4>Categories</h4>
          <span>Laptops & Workstations</span>
          <span>Networking</span>
          <span>Audio & Gaming</span>
        </div>

        <div>
          <h4>Support</h4>
          <span>Mon-Sat · 9:00 AM to 8:00 PM</span>
          <span>support@voltmart.in</span>
          <span>+91 98765 43210</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
