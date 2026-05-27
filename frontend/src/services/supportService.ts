import api from "./api";
import { BulkInquiry, BulkInquiryLineItemPayload } from "../types/store";

export const submitBulkOrder = async (payload: {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  productCategory: string;
  estimatedQuantity: number;
  requirements: string;
  deliveryCity?: string;
  budgetAmount?: number | null;
  rfqRequired: boolean;
  priorityRequest: boolean;
  items: BulkInquiryLineItemPayload[];
}) => {
  const response = await api.post<BulkInquiry>("/support/bulk-order", payload);
  return response.data;
};
