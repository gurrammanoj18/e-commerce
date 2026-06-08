import React from "react";
import { Link } from "react-router-dom";
import "../../styles/product/CategoryCard.css";
import { CategorySummary } from "../../types/store";
import { resolveMediaUrl } from "../../utils/mediaUrl";

interface CategoryCardProps {
  category: CategorySummary;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const categoryKey = category.slug ?? category.name.toLowerCase().replace(/\s+/g, "-");
  const categoryTarget = category.slug ?? category.name;
  const categoryImage = resolveMediaUrl(category.image);
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
