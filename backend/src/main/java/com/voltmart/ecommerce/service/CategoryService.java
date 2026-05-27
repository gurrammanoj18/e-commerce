package com.voltmart.ecommerce.service;

import com.voltmart.ecommerce.dto.category.CategoryResponse;
import com.voltmart.ecommerce.dto.category.CategoryRequest;

import java.util.List;

public interface CategoryService {
    List<CategoryResponse> getCategories();
    CategoryResponse createCategory(CategoryRequest request);
    CategoryResponse updateCategory(Long id, CategoryRequest request);
    void deleteCategory(Long id);
}
