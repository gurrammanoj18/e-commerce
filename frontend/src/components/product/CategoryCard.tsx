import React from "react";
import { Link } from "react-router-dom";
import "../../styles/product/CategoryCard.css";
import { CategorySummary } from "../../types/store";
import { resolveMediaUrl } from "../../utils/mediaUrl";
import appliancesImage from "../../assets/categories/appliances.jpg";
import bathroomImage from "../../assets/categories/bathroom.jpg";
import electricalsImage from "../../assets/categories/electricals.jpg";
import hardwareProImage from "../../assets/categories/hardware-pro.avif";
import homeUtilityImage from "../../assets/categories/home-utility.avif";
import lightingFansImage from "../../assets/categories/lighting-fans.jpg";
import plumbingImage from "../../assets/categories/plumbing.jpg";
import servicesImage from "../../assets/categories/services.svg";
import toolsImage from "../../assets/categories/tools-and-acce.avif";

interface CategoryCardProps {
  category: CategorySummary;
}

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

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const categoryKey = category.slug ?? category.name.toLowerCase().replace(/\s+/g, "-");
  const categoryTarget = category.slug ?? category.name;
  const categoryImage = resolveMediaUrl(category.image) || categoryImageMap[categoryKey] || homeUtilityImage;
  const categoryParams = new URLSearchParams({
    discover: "1",
    view: "collection",
    category: categoryTarget,
    title: category.name,
  });

  return (
    <Link
      className="category-card"
      to={categoryKey === "services" ? "/services" : `/products?${categoryParams.toString()}`}
    >
      <div className="category-card__media">
        {categoryImage ? <img src={categoryImage} alt={category.name} className="category-card__image" /> : null}
      </div>
      <div className="category-card__content">
        <h3>{category.name}</h3>
      </div>
    </Link>
  );
};

export default CategoryCard;
