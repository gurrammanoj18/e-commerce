import React from "react";
import { Link } from "react-router-dom";
import "../../styles/product/CategoryCard.css";
import { CategorySummary } from "../../types/store";

interface CategoryCardProps {
  category: CategorySummary;
}

const categoryImageMap: Record<string, string> = {
  "electrical-appliances": "/catalog/atlas-book.webp",
  "hardware-products": "/catalog/quantum-gpu.webp",
  "cleaning-products": "/catalog/orbit-camera.webp",
  "home-utility-products": "/catalog/dock-station.webp",
  "tools-accessories": "/catalog/vector-keyboard.webp",
};

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const categoryKey = category.slug ?? category.name.toLowerCase().replace(/\s+/g, "-");
  const categoryImage = categoryImageMap[categoryKey] ?? "/catalog/dock-station.webp";
  const categoryTarget = category.slug ?? category.name;

  return (
    <Link className="category-card" to={`/products?category=${encodeURIComponent(categoryTarget)}`}>
      <div className="category-card__media">
        <img src={categoryImage} alt={category.name} className="category-card__image" />
        <span className="category-card__icon" aria-hidden="true">
          {category.icon}
        </span>
      </div>
      <div className="category-card__content">
        <h3>{category.name}</h3>
      </div>
    </Link>
  );
};

export default CategoryCard;
