import api from "./api";
import { AuthResponse } from "../types/store";

export const signup = async (payload: {
  fullName: string;
  email: string;
  password: string;
}) => {
  const response = await api.post<AuthResponse>("/auth/signup", payload);
  return response.data;
};

export const login = async (payload: { email: string; password: string }) => {
  const response = await api.post<AuthResponse>("/auth/login", payload);
  return response.data;
};

export const forgotPassword = async (payload: {
  email: string;
  newPassword: string;
}) => {
  const response = await api.post<{ message: string }>("/auth/forgot-password", payload);
  return response.data;
};
