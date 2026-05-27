import React from "react";
import InfoPageLayout from "../components/shared/InfoPageLayout";

const TermsPage: React.FC = () => {
  return (
    <InfoPageLayout
      eyebrow="Legal"
      title="Terms and conditions"
      intro="These terms explain how customers can use VoltMart, place orders, and interact with our catalog and support services."
      sections={[
        {
          heading: "Using the website",
          paragraphs: [
            "By using VoltMart, you agree to provide accurate information during login, checkout, and support requests.",
            "You may browse, compare, and purchase products for personal or business use, but misuse of the platform, payment systems, or account access is not allowed.",
          ],
        },
        {
          heading: "Orders and availability",
          paragraphs: [
            "Product availability, prices, and delivery timelines may change based on inventory and location. We do our best to keep product information current.",
            "VoltMart may contact you if an order requires clarification, stock confirmation, or an update before fulfillment.",
          ],
        },
      ]}
    />
  );
};

export default TermsPage;
