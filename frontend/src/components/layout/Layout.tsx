import React from "react";
import { Link, Outlet } from "react-router-dom";
import AboutVoltmartSection from "./AboutVoltmartSection";
import Footer from "./Footer";
import Navbar from "./Navbar";
import ScrollToTop from "./ScrollToTop";
import "../../styles/layout/Navbar.css";

const Layout: React.FC = () => {
  return (
    <div className="app-shell">
      <ScrollToTop />
      <Navbar />
      <main>
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
