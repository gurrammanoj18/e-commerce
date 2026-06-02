package com.voltmart.ecommerce.repository;

import com.voltmart.ecommerce.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlug(String slug);
    List<Category> findBySlugIn(Collection<String> slugs);
    Optional<Category> findByNameIgnoreCase(String name);
    Optional<Category> findBySlugIgnoreCase(String slug);
}
