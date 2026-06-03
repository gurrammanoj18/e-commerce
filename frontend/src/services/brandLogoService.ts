import api from "./api";
import { BrandLogo } from "../types/store";

export const fetchBrandLogos = async () => {
  const response = await api.get<BrandLogo[]>("/brand-logos");
  return response.data;
};
