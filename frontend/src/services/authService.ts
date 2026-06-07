import api from "./api";
import { AuthResponse, DeliveryMode } from "../types/store";

export const adminLogin = async (payload: { email: string; password: string }) => {
  const response = await api.post<AuthResponse>("/auth/admin/login", payload);
  return response.data;
};

export const googleLogin = async (payload: { credential: string }) => {
  const response = await api.post<AuthResponse>("/auth/google", payload);
  return response.data;
};

export const msg91WidgetLogin = async (payload: { accessToken: string }) => {
  const response = await api.post<AuthResponse>("/auth/otp/widget/verify", payload);
  return response.data;
};

export const requestLoginOtp = async (payload: { phoneNumber: string }) => {
  const response = await api.post<{
    phoneNumber: string;
    message: string;
    expiresInSeconds: number;
    demoOtp?: string;
  }>("/auth/otp/request", payload);
  return response.data;
};

export const verifyLoginOtp = async (payload: { phoneNumber: string; otp: string }) => {
  const response = await api.post<AuthResponse>("/auth/otp/verify", payload);
  return response.data;
};

export const completeProfile = async (payload: {
  fullName: string;
  phoneNumber: string;
  email?: string;
  profileImageUrl?: string;
}) => {
  const response = await api.patch<AuthResponse>("/auth/profile", payload);
  return response.data;
};

export const updateDeliveryPreference = async (payload: {
  preferredDeliveryMode: DeliveryMode;
}) => {
  const response = await api.patch<AuthResponse>("/auth/delivery-preference", payload);
  return response.data;
};
