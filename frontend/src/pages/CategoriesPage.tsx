import React from "react";
import CategoryCard from "../components/product/CategoryCard";
import LoadingState from "../components/shared/LoadingState";
import { useProducts } from "../contexts/ProductContext";

const CategoriesPage: React.FC = () => {
  const { categories, loading } = useProducts();

  return (
    <section className="shell section page-section">
      <div className="page-header">
        <span className="eyebrow">Categories</span>
        <h1>Shop by setup and use case</h1>
        <p>
          Jump into curated product groups for gaming, productivity, audio,
          networking, and more.
        </p>
      </div>

      {loading ? (
        <LoadingState />
      ) : (
        <div className="category-grid">
          {categories.map((category) => (
            <CategoryCard key={category.name} category={category} />
          ))}
        </div>
      )}
    </section>
  );
};

export default CategoriesPage;
