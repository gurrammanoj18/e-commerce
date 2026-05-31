import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import SearchBar from "../shared/SearchBar";
import "../../styles/layout/Navbar.css";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useCollectionAnimation } from "../../contexts/CollectionAnimationContext";
import { useWishlist } from "../../contexts/WishlistContext";
import { checkPincodeServiceability } from "../../services/accountService";
import voltmartLogo from "../../assets/voltmart-logo.png";
import voltmartLogoBlack from "../../assets/voltmart-logo-black.png";

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, updateDeliveryPreference } = useAuth();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { registerTarget } = useCollectionAnimation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [navbarPincode, setNavbarPincode] = useState("");
  const [navbarPincodeMessage, setNavbarPincodeMessage] = useState("Enter pincode");
  const [navbarPincodeStatus, setNavbarPincodeStatus] = useState<"success" | "error" | null>(null);
  const [checkingNavbarPincode, setCheckingNavbarPincode] = useState(false);
  const [switchingMode, setSwitchingMode] = useState(false);
  const [switchVisual, setSwitchVisual] = useState<"bike" | "walk" | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const profileInitial = useMemo(
    () => user?.fullName?.trim().charAt(0).toUpperCase() || "U",
    [user?.fullName],
  );
  const profileImageUrl = user?.profileImageUrl?.trim();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 0);

    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

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
    setIsCategoryMenuOpen(false);
  };

  const handleNavbarPincodeSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = navbarPincode.trim();

    if (!/^\d{6}$/.test(normalized)) {
      setNavbarPincodeMessage("Enter valid pincode");
      setNavbarPincodeStatus("error");
      return;
    }

    setCheckingNavbarPincode(true);
    setNavbarPincodeStatus(null);
    try {
      const result = await checkPincodeServiceability(normalized);
      setNavbarPincodeMessage(
        result.serviceable ? "Delivery by 10pm" : "Not serviceable"
      );
      setNavbarPincodeStatus(result.serviceable ? "success" : "error");
    } catch {
      setNavbarPincodeMessage("Unable to check now");
      setNavbarPincodeStatus("error");
    } finally {
      setCheckingNavbarPincode(false);
    }
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    setIsCategoryMenuOpen(false);
    setIsProfileOpen(false);
    logout();
  };

  const handleToggleDeliveryMode = async () => {
    if (!user?.preferredDeliveryMode) {
      return;
    }

    setSwitchingMode(true);
    setSwitchVisual(user.preferredDeliveryMode === "HOME_DELIVERY" ? "walk" : "bike");
    const nextMode = user.preferredDeliveryMode === "HOME_DELIVERY" ? "STORE_PICKUP" : "HOME_DELIVERY";
    try {
      await updateDeliveryPreference(nextMode);
    } finally {
      window.setTimeout(() => {
        setSwitchingMode(false);
        setSwitchVisual(null);
      }, 1800);
    }
  };

  const deliveryToggleButton = user?.role === "ROLE_CUSTOMER" ? (
    <button
      type="button"
      className={`delivery-switch ${switchingMode ? "is-switching" : ""}`}
      onClick={() => void handleToggleDeliveryMode()}
    >
      Switch to {user.preferredDeliveryMode === "HOME_DELIVERY" ? "Store pickup" : "Home delivery"}
    </button>
  ) : null;

  const quickCategories = [
    { label: "All", to: "/products?discover=1" },
    { label: "Services", to: "/services" },
    { label: "Appliances", to: "/products?discover=1&category=appliances" },
    { label: "Bathroom", to: "/products?discover=1&category=bathroom" },
    { label: "Hardware", to: "/products?discover=1&category=hardware" },
    { label: "Kitchen", to: "/products?discover=1&category=kitchen" },
    { label: "Lighting & Fans", to: "/products?discover=1&category=lighting-fans" },
    { label: "Plumbing", to: "/products?discover=1&category=plumbing" },
    { label: "Power & Hand Tools", to: "/products?discover=1&category=power-hand-tools" },
    { label: "Electricals", to: "/products?discover=1&category=electricals" },
  ];

  const mobileQuickCategories = [
    { label: "All", to: "/products?discover=1" },
    { label: "Services", to: "/services" },
    { label: "Electricals", to: "/products?discover=1&category=electricals" },
    { label: "Hardware", to: "/products?discover=1&category=hardware" },
  ];

  const mobileMenuCategories = [
    { label: "Electricals", to: "/products?discover=1&category=electricals" },
    { label: "Power & Hand Tools", to: "/products?discover=1&category=power-hand-tools" },
    { label: "Appliances", to: "/products?discover=1&category=appliances" },
    { label: "Hardware", to: "/products?discover=1&category=hardware" },
    { label: "Kitchen", to: "/products?discover=1&category=kitchen" },
    { label: "Lighting & Fans", to: "/products?discover=1&category=lighting-fans" },
    { label: "Bathroom", to: "/products?discover=1&category=bathroom" },
    { label: "Plumbing", to: "/products?discover=1&category=plumbing" },
  ];

  return (
    <>
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

        {isMenuOpen ? (
          <button
            type="button"
            className="site-nav__menu-backdrop"
            aria-label="Close menu"
            onClick={() => setIsMenuOpen(false)}
          />
        ) : null}

        <div className={`site-nav__links ${isMenuOpen ? "is-open" : ""}`}>
          <NavLink
            className={({ isActive }) =>
              `site-nav__desktop-link ${isActive ? "active" : ""}`.trim()
            }
            to="/"
            end
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `site-nav__desktop-link ${isActive ? "active" : ""}`.trim()
            }
            to="/bulk-order"
            onClick={() => setIsMenuOpen(false)}
          >
            Bulk Orders
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
          {user?.role === "ROLE_CUSTOMER" ? (
            <button
              type="button"
              className={`delivery-switch delivery-switch--mobile ${
                switchingMode ? "is-switching" : ""
              }`}
              onClick={() => void handleToggleDeliveryMode()}
            >
              Switch to{" "}
              {user.preferredDeliveryMode === "HOME_DELIVERY" ? "Store pickup" : "Home delivery"}
            </button>
          ) : null}
          <div className="site-nav__mobile-drawer">
            <div className="site-nav__mobile-drawer-top">
              <strong>Welcome to VoltMart</strong>
              <div className="site-nav__mobile-drawer-actions">
                {user ? (
                  <button type="button" className="site-nav__mobile-logout" onClick={handleLogout}>
                    Logout
                  </button>
                ) : (
                  <Link
                    className="site-nav__mobile-logout"
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                )}
                <button
                  type="button"
                  className="site-nav__mobile-close"
                  onClick={() => {
                    setIsCategoryMenuOpen(false);
                    setIsMenuOpen(false);
                  }}
                  aria-label="Close menu"
                >
                  x
                </button>
              </div>
            </div>

            <div className="site-nav__mobile-drawer-section">
              <Link to="/" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <Link to="/bulk-order" onClick={() => setIsMenuOpen(false)}>
                Bulk Orders
              </Link>
              <button
                type="button"
                className={`site-nav__mobile-category-toggle ${
                  isCategoryMenuOpen ? "is-open" : ""
                }`}
                onClick={() => setIsCategoryMenuOpen((open) => !open)}
              >
                <span>Shop by Category</span>
                <span aria-hidden="true">{isCategoryMenuOpen ? "⌄" : "›"}</span>
              </button>
              {isCategoryMenuOpen ? (
                <div className="site-nav__mobile-category-list">
                  {mobileMenuCategories.map((category) => (
                    <Link
                      key={category.label}
                      to={category.to}
                      onClick={() => {
                        setIsCategoryMenuOpen(false);
                        setIsMenuOpen(false);
                      }}
                    >
                      <span>{category.label}</span>
                      <span aria-hidden="true">›</span>
                    </Link>
                  ))}
                </div>
              ) : null}
              <Link to="/orders" onClick={() => setIsMenuOpen(false)}>
                Orders
              </Link>
              <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                Account
              </Link>
              <Link to="/address" onClick={() => setIsMenuOpen(false)}>
                Address
              </Link>
              <Link to="/wallet" onClick={() => setIsMenuOpen(false)}>
                VoltMart Wallet
              </Link>
              <Link to="/services" onClick={() => setIsMenuOpen(false)}>
                VoltMart Services
              </Link>
            </div>

            <div className="site-nav__mobile-drawer-section">
              <Link to="/contact" onClick={() => setIsMenuOpen(false)}>
                Contact Us
              </Link>
              <Link to="/returns" onClick={() => setIsMenuOpen(false)}>
                Return & Refund Policy
              </Link>
              <Link to="/terms" onClick={() => setIsMenuOpen(false)}>
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>

        <div className="site-nav__utility">
          <form className="navbar-pincode-check" onSubmit={handleNavbarPincodeSubmit}>
            <span
              style={{
                color:
                  navbarPincodeStatus === "success"
                    ? "green"
                    : navbarPincodeStatus === "error"
                    ? "red"
                    : "inherit",
              }}
            >
              {navbarPincodeMessage}
            </span>
            <label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={navbarPincode}
                onChange={(event) => {
                  const digitsOnly = event.target.value.replace(/\D/g, "").slice(0, 6);
                  setNavbarPincode(digitsOnly);
                }}
                placeholder="Pincode"
                aria-label="Check delivery pincode"
              />
              <button type="submit" disabled={checkingNavbarPincode} aria-label="Check pincode">
                <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                <path
                  d="m7 4 6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              </button>
            </label>
          </form>
          <form className="site-nav__search" onSubmit={handleSearchSubmit}>
            <SearchBar
              value={searchValue}
              onChange={setSearchValue}
              placeholder="Search products"
            />
          </form>
          {isHomePage && !isScrolled ? (
            <div className="site-category-strip site-category-strip--mobile" aria-label="Quick categories">
              <div className="site-category-strip__inner">
                {mobileQuickCategories.map((category) => (
                  <NavLink
                    key={category.label}
                    to={category.to}
                    className={({ isActive }) =>
                      `site-category-strip__item ${isActive ? "is-active" : ""}`.trim()
                    }
                    end={category.label === "All"}
                  >
                    {category.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ) : null}
          <div className="delivery-switch__desktop">{deliveryToggleButton}</div>
        <div className="site-nav__quick-links">
          <Link
            className={`cart-pill cart-pill--wishlist ${wishlistCount > 0 ? "cart-pill--has-items" : ""}`}
            to="/wishlist"
            ref={(node) => registerTarget("wishlist", node)}
          >
            <span className="cart-pill__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 20.5s-7-4.35-7-10.1C5 7.45 6.97 6 9.23 6c1.46 0 2.42.71 2.77 1.39C12.35 6.71 13.31 6 14.77 6 17.03 6 19 7.45 19 10.4c0 5.75-7 10.1-7 10.1Z" />
              </svg>
              {wishlistCount > 0 ? <span className="cart-pill__badge">{wishlistCount}</span> : null}
            </span>
            <span className="cart-pill__label">Wishlist</span>
          </Link>
          <Link
            className={`cart-pill cart-pill--cart ${itemCount > 0 ? "cart-pill--has-items" : ""}`}
            to="/cart"
            ref={(node) => registerTarget("cart", node)}
          >
            <span className="cart-pill__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3.5 5h2l1.8 8.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.76L20 8H7.2" />
                <circle cx="10" cy="18.5" r="1.5" />
                <circle cx="17" cy="18.5" r="1.5" />
              </svg>
              {itemCount > 0 ? <span className="cart-pill__badge">{itemCount}</span> : null}
            </span>
            <span className="cart-pill__label">Cart</span>
          </Link>
        </div>
        </div>
        <div className={`profile-menu ${isProfileOpen ? "is-open" : ""}`} ref={profileRef}>
          <button
            className="profile-menu__trigger profile-menu__trigger--desktop"
            type="button"
            onClick={() => setIsProfileOpen((open) => !open)}
            aria-expanded={isProfileOpen}
            aria-label="Open account menu"
          >
            <span className="profile-menu__avatar">
              {profileImageUrl ? <img src={profileImageUrl} alt="" /> : profileInitial}
            </span>
          </button>
          <Link className="profile-menu__trigger profile-menu__trigger--mobile" to="/profile" aria-label="Open profile page">
            <span className="profile-menu__avatar">
              {profileImageUrl ? <img src={profileImageUrl} alt="" /> : profileInitial}
            </span>
          </Link>
          {isProfileOpen ? (
            <div className="profile-menu__panel">
              <div className="profile-menu__header">
                <strong>Welcome</strong>
              </div>
              <div className="profile-menu__links">
                <Link to="/profile" onClick={() => setIsProfileOpen(false)}>
                  <span>Profile</span>
                  <span aria-hidden="true">›</span>
                </Link>
                <Link to="/orders" onClick={() => setIsProfileOpen(false)}>
                  <span>Orders</span>
                  <span aria-hidden="true">›</span>
                </Link>
                <Link to="/address" onClick={() => setIsProfileOpen(false)}>
                  <span>Address</span>
                  <span aria-hidden="true">›</span>
                </Link>
                <Link to="/wallet" onClick={() => setIsProfileOpen(false)}>
                  <span>IBO Wallet</span>
                  <span aria-hidden="true">›</span>
                </Link>
                <button type="button" onClick={handleLogout}>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
        </nav>
      </header>
      {isHomePage ? (
        <div className="site-category-strip site-category-strip--desktop" aria-label="Quick categories">
          <div className="site-category-strip__inner shell">
            {quickCategories.map((category) => (
              <NavLink
                key={category.label}
                to={category.to}
                className={({ isActive }) =>
                  `site-category-strip__item ${isActive ? "is-active" : ""}`.trim()
                }
                end={category.label === "All"}
              >
                {category.label}
              </NavLink>
            ))}
          </div>
        </div>
      ) : null}
      {switchingMode && switchVisual ? (
        <div className="delivery-transition" role="dialog" aria-live="polite" aria-label="Delivery mode changing">
          <div className="delivery-transition__backdrop" />
          <div className="delivery-transition__card">
            <div className="delivery-transition__scene">
              {switchVisual === "bike" ? (
                <>
                  <div className="delivery-transition__route" />
                  <div className="delivery-transition__bike" aria-hidden="true">
                    <span className="delivery-transition__bike-shadow" />
                    <span className="delivery-transition__bike-wheel delivery-transition__bike-wheel--left" />
                    <span className="delivery-transition__bike-wheel delivery-transition__bike-wheel--right" />
                    <span className="delivery-transition__bike-frame" />
                    <span className="delivery-transition__bike-rider" />
                  </div>
                </>
              ) : (
                <>
                  <div className="delivery-transition__walk-path" />
                  <div className="delivery-transition__walker" aria-hidden="true">
                    <span className="delivery-transition__walker-shadow" />
                    <span className="delivery-transition__walker-head" />
                    <span className="delivery-transition__walker-body" />
                    <span className="delivery-transition__walker-arm delivery-transition__walker-arm--left" />
                    <span className="delivery-transition__walker-arm delivery-transition__walker-arm--right" />
                    <span className="delivery-transition__walker-leg delivery-transition__walker-leg--left" />
                    <span className="delivery-transition__walker-leg delivery-transition__walker-leg--right" />
                  </div>
                </>
              )}
            </div>
            <div className="delivery-transition__copy">
              <strong>
                {switchVisual === "bike"
                  ? "Riding toward home delivery"
                  : "Walking back to store pickup"}
              </strong>
              <span>
                {switchVisual === "bike"
                  ? "We’re switching your fulfilment mode to home delivery."
                  : "We’re switching your fulfilment mode to store pickup."}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Navbar;
