import React from "react";
import InfoPageLayout from "../components/shared/InfoPageLayout";
import { aboutVoltmartParagraphs } from "../content/aboutVoltmart";

const AboutPage: React.FC = () => {
  return (
    <InfoPageLayout
      eyebrow="About VoltMart"
      title="About Us"
      sections={[
        {
          heading: "Welcome to VoltMart",
          paragraphs: aboutVoltmartParagraphs,
        },
      ]}
    />
  );
};

export default AboutPage;
