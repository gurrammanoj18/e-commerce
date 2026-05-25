import React, { useEffect, useState } from "react";
import "../../styles/layout/TopBar.css";

const notices = [
  "Bulk orders for offices, gaming cafes, and system integrators.",
  "Free shipping on orders above ₹4,999 across India.",
  "Need help choosing hardware? Talk to our product specialists today.",
];

const TopBar: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((currentIndex) => (currentIndex + 1) % notices.length);
    }, 3500);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="top-bar">
      <button
        className="top-bar__nav"
        type="button"
        onClick={() =>
          setIndex((currentIndex) =>
            currentIndex === 0 ? notices.length - 1 : currentIndex - 1
          )
        }
      >
        ❮
      </button>
      <p>{notices[index]}</p>
      <button
        className="top-bar__nav"
        type="button"
        onClick={() => setIndex((currentIndex) => (currentIndex + 1) % notices.length)}
      >
        ❯
      </button>
    </section>
  );
};

export default TopBar;
