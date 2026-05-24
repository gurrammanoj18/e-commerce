package com.voltmart.ecommerce.service;

import com.voltmart.ecommerce.dto.category.CategoryResponse;

import java.util.List;

public interface CategoryService {
    List<CategoryResponse> getCategories();
}
