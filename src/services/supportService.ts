import api from "./api";

export const submitBulkOrder = async (payload: {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  productCategory: string;
  estimatedQuantity: number;
  requirements: string;
}) => {
  const response = await api.post<{ message: string }>("/support/bulk-order", payload);
  return response.data;
};
