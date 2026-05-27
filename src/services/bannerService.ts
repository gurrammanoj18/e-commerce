import api from "./api";
import { Banner } from "../types/store";

export const fetchActiveBanners = async () => {
  const response = await api.get<Banner[]>("/banners");
  return response.data;
};
