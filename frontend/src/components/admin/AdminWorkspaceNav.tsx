import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import voltmartLogo from "../../assets/voltmart-logo.png";

const adminNavItems = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/inventory", label: "Inventory & products" },
  { to: "/admin/orders", label: "Orders & users" },
  { to: "/admin/returns", label: "Returns" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/banners", label: "Banners" },
  { to: "/admin/homepage-sections", label: "Homepage sections" },
  { to: "/admin/services", label: "Services" },
  { to: "/admin/wallet", label: "Wallet" },
  { to: "/admin/bulk-inquiries", label: "Bulk inquiries" },
];

const AdminWorkspaceNav: React.FC = () => {
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <div className="admin-mobile-topbar">
        <button
          type="button"
          className="admin-mobile-topbar__menu"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open admin menu"
        >
          <span />
          <span />
          <span />
        </button>
        <div className="admin-mobile-topbar__brand">
          <img src={voltmartLogo} alt="VoltMart" />
          <small>Admin Portal</small>
        </div>
        <div className="admin-mobile-topbar__spacer" aria-hidden="true" />
      </div>

      <div className="admin-mobile-topbar-spacer" aria-hidden="true" />

      {isMobileMenuOpen ? (
        <div
          className="admin-mobile-drawer-backdrop"
          role="presentation"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <aside
            className="admin-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Admin navigation"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-mobile-drawer__header">
              <div>
                <img src={voltmartLogo} alt="VoltMart" className="admin-mobile-drawer__logo" />
                <small>Admin Portal</small>
              </div>
              <button
                type="button"
                className="admin-mobile-drawer__close"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close admin menu"
              >
                ×
              </button>
            </div>

            <nav className="admin-mobile-drawer__nav">
              {adminNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <button
              type="button"
              className="admin-mobile-drawer__logout"
              onClick={() => {
                setIsMobileMenuOpen(false);
                logout();
              }}
            >
              Logout
            </button>
          </aside>
        </div>
      ) : null}

      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <img src={voltmartLogo} alt="VoltMart" />
          <div>
            <strong>VoltMart</strong>
            <small>Admin Portal</small>
          </div>
        </div>
        <nav className="admin-nav admin-nav--sidebar">
          {adminNavItems.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button type="button" className="admin-sidebar__logout" onClick={logout}>
          Logout
        </button>
      </aside>
    </>
  );
};

export default AdminWorkspaceNav;
