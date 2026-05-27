import React from "react";
import InfoPageLayout from "../components/shared/InfoPageLayout";

const BuyingGuidesPage: React.FC = () => {
  return (
    <InfoPageLayout
      eyebrow="Guides"
      title="Buying guides"
      intro="Use VoltMart buying guides to choose the right products faster, whether you are shopping for home upkeep, repairs, or professional project work."
      sections={[
        {
          heading: "How to choose well",
          paragraphs: [
            "Start with the category that matches your use case, then compare specifications, product descriptions, and stock status before ordering.",
            "For repeated purchases or business needs, shortlist products by category and discuss larger requirements through the bulk-order flow.",
          ],
        },
        {
          heading: "What to compare",
          paragraphs: [
            "Compare quality, intended use, pricing, available replacements, and whether the product fits household, workshop, or contractor-level expectations.",
            "If you are unsure between multiple options, contact support for guidance before placing the order.",
          ],
        },
      ]}
    />
  );
};

export default BuyingGuidesPage;
