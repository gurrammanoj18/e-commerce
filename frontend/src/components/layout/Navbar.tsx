import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SearchBar from "../shared/SearchBar";
import "../../styles/layout/Navbar.css";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useWishlist } from "../../contexts/WishlistContext";
import solidNavbarLogo from "../../assets/black-logo.png";
import defaultNavbarLogo from "../../assets/eldoo-navbar-blue.png";
import { readSelectedAddressDisplay, SELECTED_ADDRESS_UPDATED_EVENT } from "../../utils/selectedAddress";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateDeliveryPreference } = useAuth();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileNavCollapsed, setIsMobileNavCollapsed] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [switchingMode, setSwitchingMode] = useState(false);
  const [switchVisual, setSwitchVisual] = useState<"bike" | "walk" | null>(null);
  const [selectedAddressDisplay, setSelectedAddressDisplay] = useState<string | null>(() =>
    readSelectedAddressDisplay(user),
  );
  const isCustomer = user?.role === "ROLE_CUSTOMER";
  const isHomePage = location.pathname === "/";
  const deliveryToggleLabel =
    user?.preferredDeliveryMode === "HOME_DELIVERY" ? "Store" : "Delivery";

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY > 0;
      setIsScrolled(scrolled);
      setIsMobileNavCollapsed(isHomePage && window.innerWidth <= 820 && window.scrollY > 20);
    };

    onScroll();
    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isHomePage]);

  useEffect(() => {
    setSelectedAddressDisplay(readSelectedAddressDisplay(user));
  }, [user]);

  useEffect(() => {
    const handleAddressUpdate = () => {
      setSelectedAddressDisplay(readSelectedAddressDisplay(user));
    };

    window.addEventListener(SELECTED_ADDRESS_UPDATED_EVENT, handleAddressUpdate);
    return () => window.removeEventListener(SELECTED_ADDRESS_UPDATED_EVENT, handleAddressUpdate);
  }, [user]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchValue.trim();
    const params = new URLSearchParams({
      discover: "1",
      view: "collection",
    });

    if (query) {
      params.set("search", query);
      params.set("title", query);
    }

    navigate(`/products?${params.toString()}`);
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
      setSwitchingMode(false);
      setSwitchVisual(null);
    }
  };

  return (
    <>
      <header
        className={`site-header ${isScrolled ? "site-header--solid" : ""} ${isMobileNavCollapsed ? "site-header--mobile-collapsed" : ""}`}
      >
        <nav className={`site-nav shell ${isHomePage ? "site-nav--home" : ""}`}>
          <div className="site-nav__brand">
            <Link className="site-logo" to="/">
              <img
                className="site-logo__image site-logo__image--light"
                src={defaultNavbarLogo}
                alt="Eldoo"
              />
              <img
                className="site-logo__image site-logo__image--dark"
                src={solidNavbarLogo}
                alt=""
                aria-hidden="true"
              />
            </Link>
            <div className="site-nav__quick-links site-nav__quick-links--brand">
              <Link
                className={`cart-pill cart-pill--wishlist ${wishlistCount > 0 ? "cart-pill--has-items" : ""}`}
                to="/wishlist"
                aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} items` : ""}`}
              >
                <span className="cart-pill__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 21s-7-4.4-7-10.2C5 7.4 6.9 6 9.1 6c1.4 0 2.5.7 2.9 1.5.4-.8 1.5-1.5 2.9-1.5 2.2 0 4.1 1.4 4.1 4.8C19 16.6 12 21 12 21Z" />
                  </svg>
                  {wishlistCount > 0 ? <span className="cart-pill__badge">{wishlistCount}</span> : null}
                </span>
                <span className="cart-pill__label">Wishlist</span>
              </Link>
              <Link
                className={`cart-pill cart-pill--cart ${itemCount > 0 ? "cart-pill--has-items" : ""}`}
                to="/cart"
                aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
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
              <Link className="cart-pill cart-pill--account" to="/profile" aria-label="My account">
                <span className="cart-pill__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="8" r="3.5" />
                    <path d="M5 20a7 7 0 0 1 14 0" />
                  </svg>
                </span>
                <span className="cart-pill__label">Account</span>
              </Link>
            </div>
          </div>

          <Link to="/address" className="site-nav__desktop-location">
            <span aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 21s6-5.1 6-10.2A6 6 0 0 0 6 10.8C6 15.9 12 21 12 21Z" />
                <circle cx="12" cy="10.5" r="2.2" />
              </svg>
            </span>
            <div><small>Deliver to</small><strong>{selectedAddressDisplay || "Select address"}</strong></div>
          </Link>

          {isHomePage ? (
            <div className="site-nav__mobile-home">
              <Link to="/address" className="site-nav__mobile-home-location">
                <span className="site-nav__mobile-home-location-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 21s6-5.1 6-10.2A6 6 0 0 0 6 10.8C6 15.9 12 21 12 21Z" />
                    <circle cx="12" cy="10.5" r="2.2" />
                  </svg>
                </span>
                <div>
                  <small>Hello, {user?.fullName?.split(" ")[0] || "Guest"}!</small>
                  <strong>{selectedAddressDisplay || "Select your address"}</strong>
                </div>
              </Link>
              <form className="site-nav__mobile-home-search" onSubmit={handleSearchSubmit}>
                <label className="site-nav__mobile-home-search-input">
                  <input
                    type="search"
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Search for products, brands & more..."
                  />
                </label>
                <button
                  type="submit"
                  className="site-nav__mobile-home-search-submit"
                  aria-label="Search"
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2.2" />
                    <path
                      d="M16.2 16.2L20 20"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </form>
            </div>
          ) : null}

          <div className="site-nav__utility">
            <form className="site-nav__search" onSubmit={handleSearchSubmit}>
              <SearchBar
                value={searchValue}
                onChange={setSearchValue}
                placeholder="Search products"
              />
            </form>
            <div className="delivery-switch__desktop">
              {isCustomer ? (
                <button
                  type="button"
                  className={`delivery-switch ${switchingMode ? "is-switching" : ""}`}
                  onClick={() => void handleToggleDeliveryMode()}
                >
                  {deliveryToggleLabel}
                </button>
              ) : null}
            </div>
          </div>
        </nav>
      </header>
      <nav className="desktop-commerce-nav" aria-label="Shop navigation">
        <div className="shell desktop-commerce-nav__inner">
          <Link className="desktop-commerce-nav__categories" to="/categories"><span>☰</span>All Categories</Link>
          <Link to="/products?discover=1&view=collection">Products</Link>
          <Link to="/services">Services</Link>
          <Link to="/bulk-order">Bulk Orders</Link>
          <Link to="/products?discover=1&view=collection&title=Best%20Offers">Best Offers</Link>
          <Link to="/#shop-by-brand">Brands</Link>
          <Link to="/orders">Track Order</Link>
        </div>
      </nav>
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
