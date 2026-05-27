import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import SearchBar from "../shared/SearchBar";
import "../../styles/layout/Navbar.css";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useCollectionAnimation } from "../../contexts/CollectionAnimationContext";
import { useWishlist } from "../../contexts/WishlistContext";
import voltmartLogo from "../../assets/voltmart-logo.png";
import voltmartLogoBlack from "../../assets/voltmart-logo-black.png";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { registerTarget } = useCollectionAnimation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const profileRef = useRef<HTMLDivElement | null>(null);
  const profileInitial = useMemo(
    () => user?.fullName?.trim().charAt(0).toUpperCase() || "U",
    [user?.fullName],
  );

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 0);

    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout();
  };

  return (
    <header
      className={`site-header ${isScrolled ? "site-header--solid" : ""} ${
        isMenuOpen ? "site-header--menu-open" : ""
      }`}
    >
      <nav className="site-nav shell">
        <button
          className="menu-toggle"
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          <span className="menu-toggle__line" />
          <span className="menu-toggle__line" />
          <span className="menu-toggle__line" />
        </button>

        <Link className="site-logo" to="/">
          <img src={isScrolled ? voltmartLogo : voltmartLogoBlack} alt="VoltMart" />
        </Link>

        <div className={`site-nav__links ${isMenuOpen ? "is-open" : ""}`}>
          <NavLink
            className={({ isActive }) => (isActive ? "active" : "")}
            to="/"
            end
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? "active" : "")}
            to="/bulk-order"
            onClick={() => setIsMenuOpen(false)}
          >
            Bulk Orders
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? "active" : "")}
            to="/about"
            onClick={() => setIsMenuOpen(false)}
          >
            About VoltMart
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `site-nav__mobile-only ${isActive ? "active" : ""}`.trim()
            }
            to="/contact"
            onClick={() => setIsMenuOpen(false)}
          >
            Support
          </NavLink>
        </div>

        <div className="site-nav__utility">
          <form className="site-nav__search" onSubmit={handleSearchSubmit}>
            <SearchBar
              value={searchValue}
              onChange={setSearchValue}
              placeholder="Search products"
            />
          </form>
        <div className="site-nav__quick-links">
          <Link
            className="cart-pill"
            to="/wishlist"
            ref={(node) => registerTarget("wishlist", node)}
          >
            <span className="cart-pill__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 20.5s-7-4.35-7-10.1C5 7.45 6.97 6 9.23 6c1.46 0 2.42.71 2.77 1.39C12.35 6.71 13.31 6 14.77 6 17.03 6 19 7.45 19 10.4c0 5.75-7 10.1-7 10.1Z" />
              </svg>
            </span>
            <span className="cart-pill__label">Wishlist</span>
            <span className="cart-pill__count">{wishlistCount}</span>
          </Link>
          <Link
            className="cart-pill"
            to="/cart"
            ref={(node) => registerTarget("cart", node)}
          >
            <span className="cart-pill__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3.5 5h2l1.8 8.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.76L20 8H7.2" />
                <circle cx="10" cy="18.5" r="1.5" />
                <circle cx="17" cy="18.5" r="1.5" />
              </svg>
            </span>
            <span className="cart-pill__label">Cart</span>
            <span className="cart-pill__count">{itemCount}</span>
          </Link>
        </div>
        </div>
        <div
          className={`profile-menu ${isProfileOpen ? "is-open" : ""}`}
          ref={profileRef}
        >
          <button
            className="profile-menu__trigger"
            type="button"
            onClick={() => setIsProfileOpen((open) => !open)}
            aria-expanded={isProfileOpen}
          >
            <span className="profile-menu__avatar">{profileInitial}</span>
          </button>
          {isProfileOpen ? (
            <div className="profile-menu__panel">
              <div className="profile-menu__header">
                <span className="profile-menu__avatar profile-menu__avatar--large">
                  {profileInitial}
                </span>
                <div>
                  <strong>{user?.fullName || "Customer"}</strong>
                  <span>{user?.email || user?.phoneNumber || "Logged in account"}</span>
                </div>
              </div>
              <div className="profile-menu__links">
                <Link to="/orders" onClick={() => setIsProfileOpen(false)}>
                  Order history
                </Link>
                <Link to="/wishlist" onClick={() => setIsProfileOpen(false)}>
                  Wishlist
                </Link>
                <Link to="/coupons" onClick={() => setIsProfileOpen(false)}>
                  Coupons
                </Link>
                <Link to="/help-center" onClick={() => setIsProfileOpen(false)}>
                  Help center
                </Link>
                <button type="button" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
