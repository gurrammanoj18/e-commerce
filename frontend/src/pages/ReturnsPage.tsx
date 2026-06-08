import React from "react";
import InfoPageLayout from "../components/shared/InfoPageLayout";

const ReturnsPage: React.FC = () => {
  return (
    <InfoPageLayout
      eyebrow="Returns"
      title="Return policy"
      intro="This return policy explains how Eldoo handles returns, replacements, refunds, and wallet credits for eligible orders after delivery."
      sections={[
        {
          heading: "Return eligibility",
          paragraphs: [
            "Return or replacement requests are accepted only for orders marked as delivered. Customers should raise the request as soon as possible after delivery if an item is damaged, defective, wrong, incomplete, or materially different from what was ordered.",
            "Products must be returned with original packaging, accessories, manuals, invoices, tags, and any free items wherever applicable. Items that are used, installed, altered, damaged after delivery, or missing parts may be rejected.",
          ],
        },
        {
          heading: "Non-returnable items",
          paragraphs: [
            "Certain products may not be returnable because of hygiene, safety, installation, electrical usage, custom order, clearance sale, or manufacturer restrictions.",
            "Consumables, cut-to-size items, opened chemicals, heavily used products, and products damaged because of incorrect handling or installation are generally not eligible unless Eldoo verifies a delivery or product issue.",
          ],
        },
        {
          heading: "How to request a return",
          paragraphs: [
            "Customers can manage eligible delivered orders from the orders page or contact Eldoo support with the order number, item details, reason, description of the issue, and clear photos or videos where required.",
            "Eldoo may ask for additional details before approving pickup, replacement, wallet credit, refund, or any other resolution.",
          ],
        },
        {
          heading: "Inspection and approval",
          paragraphs: [
            "All return requests are subject to review. Eldoo or its delivery/support team may inspect the product, packaging, serial number, accessories, and condition before approving a resolution.",
            "If the returned product fails inspection or does not match the request details, Eldoo may send the item back, reject the request, or revise the offered resolution.",
          ],
        },
        {
          heading: "Refunds, wallet credits, and replacements",
          paragraphs: [
            "Approved returns may be resolved through wallet credit, replacement, manual refund, or another support-approved method depending on payment mode, product type, and availability.",
            "For cash on delivery orders, refunds may be handled through wallet credit, manual bank transfer, or another method confirmed by support because there may be no online payment transaction to reverse.",
            "Replacement depends on stock availability. If replacement stock is unavailable, Eldoo may offer wallet credit, refund, or a suitable alternative.",
          ],
        },
        {
          heading: "Pickup and customer responsibility",
          paragraphs: [
            "If pickup is arranged, the customer must keep the item packed and ready at the agreed address and time. Failed pickup attempts may delay or cancel the request.",
            "The customer is responsible for removing personal items, checking the product being handed over, and ensuring all required parts and accessories are included.",
          ],
        },
      ]}
    />
  );
};

export default ReturnsPage;
