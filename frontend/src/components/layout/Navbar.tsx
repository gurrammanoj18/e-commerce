import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";

const Navbar: React.FC = () => {
  const { logout, user } = useAuth();
  const { itemCount } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header ${isScrolled ? "site-header--solid" : ""}`}>
      <nav className="site-nav shell">
        <Link className="site-logo" to="/products">
          VoltMart
          <span>Hardware & Electronics</span>
        </Link>

        <button
          className="menu-toggle"
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          Menu
        </button>

        <div className={`site-nav__links ${isMenuOpen ? "is-open" : ""}`}>
          <NavLink
            className={({ isActive }) => (isActive ? "active" : "")}
            to="/products"
          >
            Shop
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? "active" : "")}
            to="/categories"
          >
            Categories
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? "active" : "")}
            to="/bulk-order"
          >
            Bulk Orders
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? "active" : "")}
            to="/contact"
          >
            Support
          </NavLink>
        </div>

        <div className="site-nav__actions">
          <Link
            className="nav-icon"
            to="/products?discover=1"
            aria-label="Search products"
          >
            🔍
          </Link>
          <button className="auth-pill" type="button" onClick={logout}>
            {user?.fullName || "Account"} · Logout
          </button>
          <Link className="cart-pill" to="/cart">
            Cart
            <span>{itemCount}</span>
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
