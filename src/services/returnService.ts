import api from "./api";
import { ReturnRequest, ReturnRequestPayload, ReturnRequestUpdatePayload } from "../types/store";

export const submitReturnRequest = async (payload: ReturnRequestPayload) => {
  const response = await api.post<ReturnRequest>("/returns/requests", payload);
  return response.data;
};

export const fetchReturnRequests = async () => {
  const response = await api.get<ReturnRequest[]>("/returns/requests");
  return response.data;
};

export const fetchAdminReturnRequests = async () => {
  const response = await api.get<ReturnRequest[]>("/admin/returns");
  return response.data;
};

export const updateAdminReturnRequest = async (
  id: number,
  payload: ReturnRequestUpdatePayload,
) => {
  const response = await api.patch<ReturnRequest>(`/admin/return-actions/${id}`, payload);
  return response.data;
};
