import React from "react";
import { Link } from "react-router-dom";
import "../../styles/product/CategoryCard.css";
import { CategorySummary } from "../../types/store";
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
  const categoryImage = category.image || categoryImageMap[categoryKey] || homeUtilityImage;
  const categoryTarget = category.slug ?? category.name;

  return (
    <Link
      className="category-card"
      to={
        categoryKey === "services"
          ? "/services"
          : `/products?category=${encodeURIComponent(categoryTarget)}`
      }
    >
      <div className="category-card__media">
        <img src={categoryImage} alt={category.name} className="category-card__image" />
      </div>
      <div className="category-card__content">
        <h3>{category.name}</h3>
      </div>
    </Link>
  );
};

export default CategoryCard;
