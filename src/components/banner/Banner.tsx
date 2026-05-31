import React from "react";
import { Link } from "react-router-dom";
import "../../styles/components/Banner.css";

const Banner: React.FC = () => {
    return (
        <section className="banner">
            <div className="overlay">
                <div className="banner-content">
                    <div className="banner-options">
                        <span className="home-icon">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                viewBox="0 0 16 16"
                            >
                                <path d="M8 .5l6.5 6.5V15a1 1 0 0 1-1 1h-4v-4H6v4H2a1 1 0 0 1-1-1V7L8 .5z" />
                            </svg>
                        </span>
                        <Link className="banner-option option-home" to="/products">
                            Collections
                        </Link>
                        <p className="banner-option">All products</p>
                    </div>
                    <h1 className="banner-title">All products</h1>
                </div>
            </div>
        </section>
    );
};

export default Banner;
