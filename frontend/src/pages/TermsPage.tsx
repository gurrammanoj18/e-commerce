import React from "react";
import InfoPageLayout from "../components/shared/InfoPageLayout";

const TermsPage: React.FC = () => {
  return (
    <InfoPageLayout
      eyebrow="Legal"
      title="Terms and conditions"
      intro="These terms govern your use of Eldoo, including browsing products, creating an account, placing orders, using delivery or pickup options, and requesting support."
      sections={[
        {
          heading: "Acceptance of terms",
          paragraphs: [
            "By accessing or using Eldoo, you agree to follow these terms and all applicable laws. If you do not agree, please do not use the website or place an order.",
            "Eldoo may update these terms from time to time. Continued use of the website after updates means you accept the revised terms.",
          ],
        },
        {
          heading: "Account and customer information",
          paragraphs: [
            "You are responsible for keeping your login details, phone number, address, and delivery preferences accurate. Eldoo may use these details to verify orders, arrange delivery or pickup, and provide support.",
            "You must not use another customer's account, provide false information, interfere with the website, or misuse offers, wallet benefits, checkout, payment, or support features.",
          ],
        },
        {
          heading: "Products, pricing, and availability",
          paragraphs: [
            "Product images, descriptions, prices, stock, discounts, and delivery timelines are shown as accurately as possible, but they may change because of supplier updates, stock movement, or operational reasons.",
            "If a listed item becomes unavailable, incorrectly priced, or unsuitable for fulfilment, Eldoo may contact you to confirm a replacement, modify the order, or cancel the affected item with an appropriate refund or adjustment.",
          ],
        },
        {
          heading: "Orders, payment, delivery, and pickup",
          paragraphs: [
            "An order is confirmed only after Eldoo accepts it and begins fulfilment. We may call or message you for address, pincode, product, payment, or availability confirmation.",
            "Home delivery is subject to serviceable locations, product availability, order value, and operational capacity. Store pickup orders must be collected according to the timing shared by Eldoo.",
            "Cash on delivery, wallet credit, manual refunds, and other payment or adjustment methods may be offered based on order type and eligibility.",
          ],
        },
        {
          heading: "Cancellations, returns, and refunds",
          paragraphs: [
            "Cancellation, return, replacement, wallet credit, and refund requests are handled according to Eldoo's return policy and the condition of the product.",
            "Returned products may be inspected before approval. Eldoo may reject requests involving used, damaged, incomplete, altered, or non-returnable items unless the issue is caused by delivery damage, wrong product dispatch, or another verified service problem.",
          ],
        },
        {
          heading: "Limitation of responsibility",
          paragraphs: [
            "Eldoo works to keep the platform reliable, but we do not guarantee that the website will always be uninterrupted, error-free, or free from external technical issues.",
            "To the extent allowed by law, Eldoo is not responsible for indirect, incidental, or consequential losses arising from website use, delayed service, product unavailability, or third-party service interruptions.",
          ],
        },
      ]}
    />
  );
};

export default TermsPage;
