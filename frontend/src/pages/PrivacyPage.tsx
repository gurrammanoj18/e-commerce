import React from "react";
import InfoPageLayout from "../components/shared/InfoPageLayout";

const PrivacyPage: React.FC = () => {
  return (
    <InfoPageLayout
      eyebrow="Privacy"
      title="Privacy policy"
      intro="This privacy policy explains how Eldoo collects, uses, stores, and protects information when customers use the website, create an account, place orders, request services, or contact support."
      sections={[
        {
          heading: "Information we collect",
          paragraphs: [
            "We may collect your name, phone number, email address, profile details, delivery addresses, pincode, delivery preference, order history, return requests, wallet activity, support messages, and service request details.",
            "We also collect basic technical information such as device, browser, session, and usage information to keep the website secure, reliable, and easier to use.",
          ],
        },
        {
          heading: "How we use your information",
          paragraphs: [
            "Eldoo uses customer information to create and manage accounts, verify login, process orders, arrange home delivery or store pickup, check pincode serviceability, provide invoices, manage returns, and respond to support requests.",
            "We may use your contact details to send order updates, delivery updates, OTP messages, support responses, return status updates, wallet notifications, and important service messages.",
          ],
        },
        {
          heading: "Payments, wallet, and refunds",
          paragraphs: [
            "Payment, cash on delivery, wallet credit, coupon, refund, and return information may be processed to complete purchases, resolve disputes, prevent misuse, and maintain accurate transaction records.",
            "Eldoo does not ask customers to share sensitive payment passwords or banking credentials through support chats, calls, or forms.",
          ],
        },
        {
          heading: "Sharing information",
          paragraphs: [
            "We may share necessary information with delivery partners, payment or messaging providers, service professionals, technology vendors, and support teams only to operate Eldoo and complete customer requests.",
            "We do not sell customer personal information. Information may be disclosed if required by law, fraud prevention, security investigation, or protection of Eldoo's legal rights.",
          ],
        },
        {
          heading: "Data storage and security",
          paragraphs: [
            "We use reasonable technical and organizational safeguards to protect customer information from unauthorized access, misuse, loss, or alteration.",
            "No digital platform can guarantee absolute security. Customers should keep login details private and contact Eldoo immediately if they suspect unauthorized account activity.",
          ],
        },
        {
          heading: "Your choices",
          paragraphs: [
            "You may update account details, delivery addresses, and delivery preferences through your account where available. You may also contact support for help correcting information or asking privacy-related questions.",
            "Some information may need to be retained for order history, legal compliance, accounting, fraud prevention, returns, warranty, or dispute resolution.",
          ],
        },
      ]}
    />
  );
};

export default PrivacyPage;
