import api from "./api";
import { BulkInquiry } from "../types/store";

export const submitBulkOrder = async (payload: {
  name: string;
  address: string;
  mobileNumber: string;
  email?: string;
  requirements: string;
  priorityRequest: boolean;
}) => {
  const response = await api.post<BulkInquiry>("/support/bulk-order", payload);
  return response.data;
};
