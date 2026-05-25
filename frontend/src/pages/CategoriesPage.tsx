import React from "react";
import "../styles/pages/CategoriesPage.css";
import CategoryCard from "../components/product/CategoryCard";
import LoadingState from "../components/shared/LoadingState";
import { useProducts } from "../contexts/ProductContext";

const CategoriesPage: React.FC = () => {
  const { categories, loading } = useProducts();

  return (
    <section className="shell section page-section">
      <div className="page-header">
        <span className="eyebrow">Categories</span>
        <h1>Shop by category and subcategory</h1>
        <p>
          Explore your core catalog groups for electrical appliances, hardware
          products, cleaning products, home utility products, and tools and
          accessories.
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
