import React from "react";
import { aboutVoltmartHighlights, aboutVoltmartParagraphs } from "../../content/aboutVoltmart";
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

        <div className="about-voltmart-band__highlights">
          <h3>Why Choose Us?</h3>
          <ul>
            {aboutVoltmartHighlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default AboutVoltmartSection;
