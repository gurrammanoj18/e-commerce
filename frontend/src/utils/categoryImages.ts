import { CategorySummary } from "../types/store";
import { resolveMediaUrl } from "./mediaUrl";
import appliancesImage from "../assets/categories/appliances.jpg";
import bathroomImage from "../assets/categories/bathroom.jpg";
import electricalsImage from "../assets/categories/electricals.jpg";
import hardwareProImage from "../assets/categories/hardware-pro.avif";
import homeUtilityImage from "../assets/categories/home-utility.avif";
import lightingFansImage from "../assets/categories/lighting-fans.jpg";
import plumbingImage from "../assets/categories/plumbing.jpg";
import servicesImage from "../assets/categories/services.svg";
import toolsImage from "../assets/categories/tools-and-acce.avif";

const categoryImageMap: Record<string, string> = {
  appliances: appliancesImage,
  electricals: electricalsImage,
  "power-hand-tools": toolsImage,
  hardware: hardwareProImage,
  "lighting-fans": lightingFansImage,
  bathroom: bathroomImage,
  plumbing: plumbingImage,
  kitchen: homeUtilityImage,
  services: servicesImage,
};

export const getCategoryKey = (category: CategorySummary) =>
  category.slug ?? category.name.toLowerCase().replace(/\s+/g, "-");

export const getCategoryCoverImage = (category: CategorySummary) => {
  const categoryKey = getCategoryKey(category);
  return categoryImageMap[categoryKey] || resolveMediaUrl(category.image) || homeUtilityImage;
};
