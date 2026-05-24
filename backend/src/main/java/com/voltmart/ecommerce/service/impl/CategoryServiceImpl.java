package com.voltmart.ecommerce.service.impl;

import com.voltmart.ecommerce.dto.category.CategoryResponse;
import com.voltmart.ecommerce.mapper.EntityMapper;
import com.voltmart.ecommerce.repository.CategoryRepository;
import com.voltmart.ecommerce.repository.ProductRepository;
import com.voltmart.ecommerce.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final EntityMapper entityMapper;

    @Override
    public List<CategoryResponse> getCategories() {
        var products = productRepository.findAll();
        return categoryRepository.findAll().stream()
                .map(category -> entityMapper.toCategoryResponse(
                        category,
                        products.stream().filter(product -> product.getCategory().getId().equals(category.getId())).count()
                ))
                .toList();
    }
}
