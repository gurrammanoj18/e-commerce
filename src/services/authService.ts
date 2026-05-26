import api from "./api";
import { AuthResponse, OtpChallengeResponse } from "../types/store";

export const requestOtp = async (payload: { email: string }) => {
  const response = await api.post<OtpChallengeResponse>("/auth/otp/request", payload);
  return response.data;
};

export const verifyOtp = async (payload: { email: string; otpCode: string }) => {
  const response = await api.post<AuthResponse>("/auth/otp/verify", payload);
  return response.data;
};

export const adminLogin = async (payload: { email: string; password: string }) => {
  const response = await api.post<AuthResponse>("/auth/admin/login", payload);
  return response.data;
};

export const googleLogin = async (payload: { credential: string }) => {
  const response = await api.post<AuthResponse>("/auth/google", payload);
  return response.data;
};
