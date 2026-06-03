import api from "./api";
import { HomepageSection } from "../types/store";

export const fetchHomepageSections = async () => {
  const response = await api.get<HomepageSection[]>("/homepage-sections");
  return response.data;
};
