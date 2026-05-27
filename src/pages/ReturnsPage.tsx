import React from "react";
import InfoPageLayout from "../components/shared/InfoPageLayout";

const ReturnsPage: React.FC = () => {
  return (
    <InfoPageLayout
      eyebrow="Orders"
      title="Returns policy"
      intro="VoltMart aims to keep returns clear and practical for customers who receive the wrong item, a damaged product, or an issue with quality."
      sections={[
        {
          heading: "When a return may apply",
          paragraphs: [
            "Return requests typically apply when a product arrives damaged, differs from the order, or has a clear quality issue on delivery.",
            "Customers should contact support promptly with order details and a short description of the issue so the team can review the request quickly.",
          ],
        },
        {
          heading: "How support helps",
          paragraphs: [
            "Our team may ask for images, order information, or replacement preferences before confirming the next step.",
            "Depending on the case, VoltMart may guide you through a replacement, a return approval, or another resolution that fits the product issue.",
          ],
        },
      ]}
    />
  );
};

export default ReturnsPage;
