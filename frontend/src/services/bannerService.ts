import api from "./api";
import { Banner } from "../types/store";

export const fetchBanners = async () => {
  const response = await api.get<Banner[]>("/banners");
  return response.data;
};

export const fetchSeasonalPicks = async () => {
  const response = await api.get<Banner[]>("/banners/seasonal-picks");
  return response.data;
};
