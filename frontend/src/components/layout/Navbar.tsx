import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import SearchBar from "../shared/SearchBar";
import "../../styles/layout/Navbar.css";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useWishlist } from "../../contexts/WishlistContext";

const pincodes = ["560001", "110001", "400001", "600001", "700001"];

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedPincode, setSelectedPincode] = useState(pincodes[0]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 0);

    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchValue.trim();

    navigate(
      query
        ? `/products?discover=1&search=${encodeURIComponent(query)}`
        : "/products?discover=1"
    );
    setIsMenuOpen(false);
  };

  return (
    <header className={`site-header ${isScrolled ? "site-header--solid" : ""}`}>
      <nav className="site-nav shell">
        <Link className="site-logo" to="/">
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
            to="/"
            end
          >
            Home
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? "active" : "")}
            to="/bulk-order"
          >
            Bulk Orders
          </NavLink>
        </div>

        <div className="site-nav__actions">
          <form className="site-nav__search" onSubmit={handleSearchSubmit}>
            <SearchBar
              value={searchValue}
              onChange={setSearchValue}
              placeholder="Search products"
            />
            <label className="site-nav__pincode">
              <span>Pincode</span>
              <select
                value={selectedPincode}
                onChange={(event) => setSelectedPincode(event.target.value)}
              >
                {pincodes.map((pincode) => (
                  <option key={pincode} value={pincode}>
                    {pincode}
                  </option>
                ))}
              </select>
            </label>
          </form>
          <button className="auth-pill" type="button" onClick={logout}>
            {user?.fullName || "Account"} · Logout
          </button>
          <Link className="cart-pill" to="/wishlist">
            Wishlist
            <span>{wishlistCount}</span>
          </Link>
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
