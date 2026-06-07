import React, { useEffect } from "react";
// @ts-ignore: side-effect CSS import without type declarations
import "../../components/navbar/Navbar.css";

const Navbar: React.FC = () => {
  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector(".navbar");
      if (window.scrollY > 50) {
        navbar?.classList.add("scrolled");
      } else {
        navbar?.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="navbar-wrapper">
      <div className="main-div">
        <nav className="navbar">
          <div className="navbar-left">
            <div className="logo">Eldoo</div>
          </div>

          <div className="nav-links-container">
            <ul className="nav-links">
              <li>Shop</li>
              <li>Collections</li>
              <li>Explore</li>
              <li>Compare</li>
              <li>Contact</li>
              <li>Theme features</li>
            </ul>
          </div>

          <div className="navbar-right">
            <div className="icons">
              <span className="icon">🔍</span>
              <span className="icon">👤</span>
              <span className="icon">🛒</span>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
