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
          <Link to="/contact">Contact Us</Link>
          <Link to="/contact">Support</Link>
          <a href="https://wa.me/919398546891" target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          <a href="mailto:support@Eldoo.in">Email</a>
          <Link to="/terms">Terms &amp; Conditions</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/returns">Returns Policy</Link>
          <Link to="/buying-guides">Buying Guides</Link>
        </div>

        <div className="footer-column">
          <h3>CONNECT WITH US</h3>
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
        <p>Copyright © 2026, Eldoo, or its affiliates</p>
      </div>
    </footer>
  );
};

export default Footer;
