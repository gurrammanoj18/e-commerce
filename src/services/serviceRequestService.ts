import api from "./api";
import { ServiceRequest, ServiceRequestPayload } from "../types/store";

export const submitServiceRequest = async (payload: ServiceRequestPayload) => {
  const response = await api.post<ServiceRequest>("/services/requests", payload);
  return response.data;
};
