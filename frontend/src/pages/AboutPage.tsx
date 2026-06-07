import React from "react";
import InfoPageLayout from "../components/shared/InfoPageLayout";
import { aboutEldooParagraphs } from "../content/aboutVoltmart";

const AboutPage: React.FC = () => {
  return (
    <InfoPageLayout
      eyebrow="About Eldoo"
      title="About Us"
      sections={[
        {
          heading: "Welcome to Eldoo",
          paragraphs: aboutEldooParagraphs,
        },
      ]}
    />
  );
};

export default AboutPage;
