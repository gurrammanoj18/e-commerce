import React from "react";
import { Link } from "react-router-dom";
import "../../styles/layout/Footer.css";

const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-column">
          <h3>ONLINE SHOPPING</h3>
          <Link to="/products?category=appliances">Appliances</Link>
          <Link to="/products?category=electricals">Electricals</Link>
          <Link to="/products?category=power-hand-tools">Power &amp; Hand Tools</Link>
          <Link to="/products?category=hardware">Hardware</Link>
          <Link to="/products?category=lighting-fans">Lighting &amp; Fans</Link>
          <Link to="/products?category=bathroom">Bathroom</Link>
          <Link to="/products?category=plumbing">Plumbing</Link>
          <Link to="/products?category=kitchen">Kitchen</Link>
        </div>

        <div className="footer-column">
          <h3>QUICK LINKS</h3>
          <Link to="/about">About VoltMart</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/terms">Terms &amp; Conditions</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/returns">Returns Policy</Link>
          <Link to="/buying-guides">Buying Guides</Link>
        </div>

        <div className="footer-column footer-column--about">
          <h3>ABOUT VOLTMART</h3>
          <p>
            VoltMart is a practical ecommerce destination for appliances,
            electricals, tools, hardware, lighting, bathroom, plumbing, and
            kitchen essentials.
          </p>
          <p>
            We help homeowners, technicians, contractors, and everyday shoppers
            discover dependable products with category-first browsing, trusted
            quality, and a smoother online buying experience.{" "}
            <Link to="/products">READ MORE</Link>
          </p>

          <h3 className="footer-social-title">CONNECT WITH US</h3>
          <div className="footer-socials" aria-label="Social links">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              f
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              ◎
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              in
            </a>
          </div>
        </div>
      </div>

      <div className="shell footer-bottom">
        <p>Copyright © 2026, VoltMart, or its affiliates</p>
      </div>
    </footer>
  );
};

export default Footer;
