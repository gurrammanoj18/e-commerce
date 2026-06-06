import api from "./api";
import { HomepageSectionContent } from "../types/store";

export const fetchHomepageSections = async () => {
  const response = await api.get<HomepageSectionContent[]>("/homepage-sections");
  return response.data;
};
