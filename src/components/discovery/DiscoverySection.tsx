import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import "../../styles/components/DiscoverySection.css";

const DiscoverySection: React.FC = () => {
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Left + Right columns → move UP
  const yLeft = useTransform(scrollYProgress, [0, 1], [-100, +100]);
  const yRight = useTransform(scrollYProgress, [0, 1], [-100, +100]);

  // Middle column → move DOWN (opposite direction)
  const yMiddle = useTransform(scrollYProgress, [0, 1], [+100, -100]);

  return (
    <div className="discovery-container">
    <section className="hero" ref={sectionRef}>
      <div className="hero-content">
        <span className="hero-subtitle">HARMONY SOUND</span>
        <h1 className="hero-title">
          Discover Pure <br /> Euphony
        </h1>
        <p className="hero-description">
          Delve into Harmony Sound's curated collection, where every product is
          designed for discerning ears. From premium headphones to essential
          accessories, experience the pinnacle of auditory excellence. Your
          symphony of perfection awaits.
        </p>
      </div>

      <div className="hero-images">
        <div className="image-grid">
          {/* Left column */}
          <div className="image-column">
            <motion.div className="image-box img1" style={{ y: yLeft }} />
            <motion.div className="image-box img4" style={{ y: yLeft }} />
            <motion.div className="image-box img7" style={{ y: yLeft }} />
            <motion.div className="image-box img10" style={{ y: yLeft }} />
          </div>

          {/* Middle column */}
          <div className="image-column">
            <motion.div className="image-box img2" style={{ y: yMiddle }} />
            <motion.div className="image-box img5" style={{ y: yMiddle }} />
            <motion.div className="image-box img8" style={{ y: yMiddle }} />
            <motion.div className="image-box img11" style={{ y: yMiddle }} />
          </div>

          {/* Right column */}
          <div className="image-column">
            <motion.div className="image-box img3" style={{ y: yRight }} />
            <motion.div className="image-box img6" style={{ y: yRight }} />
            <motion.div className="image-box img9" style={{ y: yRight }} />
            <motion.div className="image-box img12" style={{ y: yRight }} />
          </div>
        </div>
      </div>
         </section>

      {/* Benefits Section */}
      <section className="benefits-bar">
        <div className="benefit">
          <img src="/icons/headset.svg" alt="Customer Service" />
          <div>
            <h4>Customer service</h4>
            <p>It’s not actually free we just price it into the products.</p>
          </div>
        </div>

        <div className="benefit">
          <img src="/icons/box.svg" alt="Fast Free Shipping" />
          <div>
            <h4>Fast Free Shipping</h4>
            <p>Get free shipping on orders of $150 or more</p>
          </div>
        </div>

        <div className="benefit">
          <img src="/icons/link.svg" alt="Refer a friend" />
          <div>
            <h4>Refer a friend</h4>
            <p>Refer a friend and get 15% off each other.</p>
          </div>
        </div>

        <div className="benefit">
          <img src="/icons/lock.svg" alt="Secure payment" />
          <div>
            <h4>Secure payment</h4>
            <p>Your payment information is processed securely</p>
          </div>
        </div>
      </section>
 
    </div>
  );
};

export default DiscoverySection;
