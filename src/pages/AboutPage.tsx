import React from "react";
import InfoPageLayout from "../components/shared/InfoPageLayout";
import { aboutVoltmartHighlights, aboutVoltmartParagraphs } from "../content/aboutVoltmart";

const AboutPage: React.FC = () => {
  return (
    <InfoPageLayout
      eyebrow="About VoltMart"
      title="About Us"
      intro="Learn how VoltMart combines quick-commerce convenience, reliable product categories, and customer-first service into one scalable shopping platform."
      sections={[
        {
          heading: "Welcome to VoltMart",
          paragraphs: aboutVoltmartParagraphs,
        },
        {
          heading: "Why Choose Us?",
          paragraphs: aboutVoltmartHighlights.map((item) => item),
        },
      ]}
    />
  );
};

export default AboutPage;
