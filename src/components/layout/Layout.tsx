import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import AboutVoltmartSection from "./AboutVoltmartSection";
import Footer from "./Footer";
import Navbar from "./Navbar";
import ScrollToTop from "./ScrollToTop";
import "../../styles/layout/Navbar.css";

const Layout: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="app-shell">
      <ScrollToTop />
      <Navbar />
      <div className="shell app-tagline" aria-label="Site tagline">
        <span className="eyebrow">Appliances, Electricals &amp; Home Essentials</span>
      </div>
      <main className={isHomePage ? "app-main app-main--home" : "app-main app-main--page"}>
        <Outlet />
      </main>
      <Link className="floating-support-button" to="/contact" aria-label="Contact support">
        Support
      </Link>
      <Footer />
      <AboutVoltmartSection />
    </div>
  );
};

export default Layout;
