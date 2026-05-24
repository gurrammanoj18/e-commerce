import React from "react";
import { Link } from "react-router-dom";
import { CategorySummary } from "../../types/store";

interface CategoryCardProps {
  category: CategorySummary;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Link
      className="store-card category-card"
      to={`/products?category=${encodeURIComponent(category.name)}`}
    >
      <span className="category-card__icon">{category.icon}</span>
      <h3>{category.name}</h3>
      <p>{category.description}</p>
      <strong>{category.count} products</strong>
    </Link>
  );
};

export default CategoryCard;
