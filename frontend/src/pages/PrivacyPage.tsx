import React from "react";
import InfoPageLayout from "../components/shared/InfoPageLayout";

const PrivacyPage: React.FC = () => {
  return (
    <InfoPageLayout
      eyebrow="Privacy"
      title="Privacy policy"
      intro="VoltMart uses customer information to provide account access, order processing, support, and a smoother shopping experience."
      sections={[
        {
          heading: "Information we collect",
          paragraphs: [
            "We may collect your name, contact details, delivery preferences, order information, and messages shared through login, checkout, or support forms.",
            "This information helps us manage your account, process orders, and respond to product or delivery questions.",
          ],
        },
        {
          heading: "How we use it",
          paragraphs: [
            "We use collected information to complete purchases, provide customer support, improve storefront experiences, and communicate important order updates.",
            "VoltMart does not use customer data for purposes unrelated to operating and improving the service experience you expect from the platform.",
          ],
        },
      ]}
    />
  );
};

export default PrivacyPage;
