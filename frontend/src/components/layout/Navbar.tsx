import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import SearchBar from "../shared/SearchBar";
import "../../styles/layout/Navbar.css";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useWishlist } from "../../contexts/WishlistContext";
import { getCategories } from "../../services/productService";
import { CategorySummary } from "../../types/store";
import {
  readSelectedAddressDisplay,
  SELECTED_ADDRESS_UPDATED_EVENT,
} from "../../utils/selectedAddress";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user, updateDeliveryPreference } = useAuth();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [switchingMode, setSwitchingMode] = useState(false);
  const [switchVisual, setSwitchVisual] = useState<"bike" | "walk" | null>(null);
  const [navbarPromos, setNavbarPromos] = useState<CategorySummary[]>([]);
  const [selectedAddressDisplay, setSelectedAddressDisplay] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const profileInitial = useMemo(
    () => user?.fullName?.trim().charAt(0).toUpperCase() || "U",
    [user?.fullName],
  );
  const profileImageUrl = user?.profileImageUrl?.trim();
  const isCustomer = user?.role === "ROLE_CUSTOMER";
  const deliveryToggleLabel =
    user?.preferredDeliveryMode === "HOME_DELIVERY" ? "Store" : "Delivery";
  const selectedAddressParts = selectedAddressDisplay?.split(" · ", 2) ?? null;

  useEffect(() => {
    const refreshSelectedAddress = () => {
      setSelectedAddressDisplay(readSelectedAddressDisplay(user));
    };

    refreshSelectedAddress();
    window.addEventListener(SELECTED_ADDRESS_UPDATED_EVENT, refreshSelectedAddress);
    return () => window.removeEventListener(SELECTED_ADDRESS_UPDATED_EVENT, refreshSelectedAddress);
  }, [user]);

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

  useEffect(() => {
    const loadNavbarPromos = async () => {
      try {
        const categories = await getCategories();
        setNavbarPromos(
          categories.filter(
            (category) =>
              !category.parentId && category.showInNavbar && category.slug !== "services",
          ),
        );
      } catch {
        setNavbarPromos([]);
      }
    };

    void loadNavbarPromos();
    window.addEventListener("catalog:categories-updated", loadNavbarPromos);
    return () => window.removeEventListener("catalog:categories-updated", loadNavbarPromos);
  }, []);

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
    setIsMenuOpen(false);
    setIsCategoryMenuOpen(false);
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    setIsCategoryMenuOpen(false);
    setIsProfileOpen(false);
    logout();
  };

  const handleCustomerLogin = () => {
    handleLogout();
    navigate("/login");
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

  const deliveryToggleButton = isCustomer ? (
    <button
      type="button"
      className={`delivery-switch ${switchingMode ? "is-switching" : ""}`}
      onClick={() => void handleToggleDeliveryMode()}
    >
      {deliveryToggleLabel}
    </button>
  ) : null;

  const promoNavigationItems = navbarPromos.map((category) => ({
    label: category.name,
    to: `/products?discover=1&view=collection&category=${encodeURIComponent(
      category.slug || category.name,
    )}&title=${encodeURIComponent(category.name)}`,
  }));

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
          <span>Eldoo</span>
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
              `site-nav__mobile-only ${isActive ? "active" : ""}`.trim()
            }
            to="/contact"
            onClick={() => setIsMenuOpen(false)}
          >
            Support
          </NavLink>
          {isCustomer ? (
            <button
              type="button"
              className={`delivery-switch delivery-switch--mobile ${
                switchingMode ? "is-switching" : ""
              }`}
              onClick={() => void handleToggleDeliveryMode()}
            >
              {deliveryToggleLabel}
            </button>
          ) : null}
          <div className="site-nav__mobile-drawer">
            <div className="site-nav__mobile-drawer-top">
              <strong>Welcome</strong>
              <div className="site-nav__mobile-drawer-actions">
                {isCustomer ? (
                  <button
                    type="button"
                    className="site-nav__mobile-logout site-nav__mobile-switch"
                    onClick={() => void handleToggleDeliveryMode()}
                  >
                    {deliveryToggleLabel}
                  </button>
                ) : user ? (
                  <button
                    type="button"
                    className="site-nav__mobile-logout"
                    onClick={handleCustomerLogin}
                  >
                    Customer login
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
              {promoNavigationItems.length ? (
                <>
                  <button
                    type="button"
                    className={`site-nav__mobile-category-toggle ${
                      isCategoryMenuOpen ? "is-open" : ""
                    }`}
                    onClick={() => setIsCategoryMenuOpen((open) => !open)}
                  >
                    <span>Promotions</span>
                    <span aria-hidden="true">{isCategoryMenuOpen ? "⌄" : "›"}</span>
                  </button>
                  {isCategoryMenuOpen ? (
                    <div className="site-nav__mobile-category-list">
                      {promoNavigationItems.map((category) => (
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
                </>
              ) : null}
              {isCustomer ? (
                <>
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
                    Eldoo Wallet
                  </Link>
                </>
              ) : null}
              <Link to="/services" onClick={() => setIsMenuOpen(false)}>
                Eldoo Services
              </Link>
              <Link to="/about" onClick={() => setIsMenuOpen(false)}>
                About Eldoo
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

            {user ? (
              <div className="site-nav__mobile-drawer-section site-nav__mobile-drawer-section--footer">
                <button type="button" className="site-nav__mobile-logout" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="site-nav__utility">
          <form className="site-nav__search" onSubmit={handleSearchSubmit}>
            <SearchBar
              value={searchValue}
              onChange={setSearchValue}
              placeholder="Search products"
            />
          </form>
          {!isScrolled ? (
            <div className="site-category-strip site-category-strip--mobile" aria-label="Quick categories">
              <div className="site-category-strip__inner">
                <NavLink
                  className={({ isActive }) =>
                    `site-category-strip__item ${isActive ? "is-active" : ""}`.trim()
                  }
                  to="/"
                  end
                >
                  All
                </NavLink>
                <NavLink
                  className={({ isActive }) =>
                    `site-category-strip__item ${isActive ? "is-active" : ""}`.trim()
                  }
                  to="/services"
                >
                  Services
                </NavLink>
                <NavLink
                  className={({ isActive }) =>
                    `site-category-strip__item ${isActive ? "is-active" : ""}`.trim()
                  }
                  to="/bulk-order"
                >
                  Bulk Orders
                </NavLink>
              </div>
            </div>
          ) : null}
          <div className="delivery-switch__desktop">{deliveryToggleButton}</div>
        <div className="site-nav__quick-links">
          <Link
            className="cart-pill cart-pill--address"
            to="/address"
            title={selectedAddressDisplay || "Address"}
          >
            <span className="cart-pill__icon" aria-hidden="true">⌂</span>
            {selectedAddressParts ? (
              <span className="cart-pill__address-copy">
                <strong>{selectedAddressParts[0]}</strong>
                <span>{selectedAddressParts[1]}</span>
              </span>
            ) : (
              <span className="cart-pill__label">Address</span>
            )}
            <span className="cart-pill__chevron" aria-hidden="true">⌄</span>
          </Link>
          <Link className="cart-pill cart-pill--wallet" to="/wallet">
            <span className="cart-pill__icon" aria-hidden="true">₹</span>
            <span className="cart-pill__label">Wallet</span>
          </Link>
          <Link
            className={`cart-pill cart-pill--wishlist ${wishlistCount > 0 ? "cart-pill--has-items" : ""}`}
            to="/wishlist"
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
          <Link
            className="profile-menu__trigger profile-menu__trigger--mobile"
            to={isCustomer ? "/profile" : "/login"}
            onClick={!isCustomer && user ? handleLogout : undefined}
            aria-label="Open profile page"
          >
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
                {isCustomer ? (
                  <>
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
                      <span>Wallet</span>
                      <span aria-hidden="true">›</span>
                    </Link>
                    <Link to="/about" onClick={() => setIsProfileOpen(false)}>
                      <span>About Eldoo</span>
                      <span aria-hidden="true">›</span>
                    </Link>
                    <button type="button" onClick={handleLogout}>
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/about" onClick={() => setIsProfileOpen(false)}>
                      <span>About Eldoo</span>
                      <span aria-hidden="true">›</span>
                    </Link>
                    <button type="button" onClick={handleCustomerLogin}>
                      <span>Customer login</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : null}
        </div>
        </nav>
      </header>
      <div className="site-category-strip site-category-strip--desktop" aria-label="Quick categories">
        <div className="site-category-strip__inner shell">
          <NavLink
            className={({ isActive }) =>
              `site-category-strip__item ${isActive ? "is-active" : ""}`.trim()
            }
            to="/"
            end
          >
            All
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `site-category-strip__item ${isActive ? "is-active" : ""}`.trim()
            }
            to="/services"
          >
            Services
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `site-category-strip__item ${isActive ? "is-active" : ""}`.trim()
            }
            to="/bulk-order"
          >
            Bulk Orders
          </NavLink>
        </div>
      </div>
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
