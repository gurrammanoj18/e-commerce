import React from "react";
import { aboutVoltmartParagraphs } from "../../content/aboutVoltmart";
import "../../styles/layout/AboutVoltmartSection.css";

const AboutVoltmartSection: React.FC = () => {
  return (
    <section className="about-voltmart-band">
      <div className="shell about-voltmart-band__inner">
        <div className="about-voltmart-band__header">
          <span className="eyebrow">About Us</span>
          <h2>About VoltMart</h2>
        </div>

        <div className="about-voltmart-band__content">
          {aboutVoltmartParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutVoltmartSection;
