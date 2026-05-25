package com.voltmart.ecommerce.service.impl;

import com.voltmart.ecommerce.dto.category.CategoryResponse;
import com.voltmart.ecommerce.entity.Category;
import com.voltmart.ecommerce.mapper.EntityMapper;
import com.voltmart.ecommerce.repository.CategoryRepository;
import com.voltmart.ecommerce.repository.ProductRepository;
import com.voltmart.ecommerce.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final EntityMapper entityMapper;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategories() {
        var categories = categoryRepository.findAll();
        Map<Long, Long> directProductCounts = new HashMap<>();

        productRepository.findAll().forEach(product ->
                directProductCounts.merge(product.getCategory().getId(), 1L, Long::sum)
        );

        return categories.stream()
                .filter(category -> category.getParent() == null)
                .sorted(Comparator.comparing(Category::getName))
                .map(category -> toCategoryTree(category, directProductCounts))
                .toList();
    }

    private CategoryResponse toCategoryTree(Category category, Map<Long, Long> directProductCounts) {
        List<CategoryResponse> subcategories = category.getChildren().stream()
                .sorted(Comparator.comparing(Category::getName))
                .map(child -> toCategoryTree(child, directProductCounts))
                .toList();

        long ownCount = directProductCounts.getOrDefault(category.getId(), 0L);
        long nestedCount = subcategories.stream()
                .mapToLong(CategoryResponse::productCount)
                .sum();

        return entityMapper.toCategoryResponse(category, ownCount + nestedCount, subcategories);
    }
}
