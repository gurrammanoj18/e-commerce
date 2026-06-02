import api from "./api";
import { Banner } from "../types/store";

export const fetchBanners = async () => {
  const response = await api.get<Banner[]>("/banners");
  return response.data;
};
