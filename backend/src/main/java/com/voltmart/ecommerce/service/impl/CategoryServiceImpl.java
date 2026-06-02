package com.voltmart.ecommerce.service.impl;

import com.voltmart.ecommerce.dto.category.CategoryResponse;
import com.voltmart.ecommerce.dto.category.CategoryRequest;
import com.voltmart.ecommerce.entity.Category;
import com.voltmart.ecommerce.exception.BadRequestException;
import com.voltmart.ecommerce.exception.ResourceNotFoundException;
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

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        boolean showInNavbar = Boolean.TRUE.equals(request.showInNavbar());
        String name = request.name().trim();
        String slug = request.slug().trim();
        validateUniqueCategory(name, slug, null);
        String image = blankToNull(request.image());
        if (!showInNavbar && image == null) {
            throw new BadRequestException("Upload a category image");
        }
        Category category = Category.builder()
                .name(name)
                .slug(slug)
                .description(blankToNull(request.description()))
                .icon(blankToNull(request.icon()))
                .image(showInNavbar ? null : image)
                .showInNavbar(showInNavbar)
                .parent(resolveParent(request.parentId(), null))
                .build();
        return toCategoryTree(categoryRepository.save(category), buildProductCounts());
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        boolean showInNavbar = Boolean.TRUE.equals(request.showInNavbar());
        String name = request.name().trim();
        String slug = request.slug().trim();
        validateUniqueCategory(name, slug, id);
        String image = blankToNull(request.image());
        if (!showInNavbar && image == null) {
            throw new BadRequestException("Upload a category image");
        }
        category.setName(name);
        category.setSlug(slug);
        category.setDescription(blankToNull(request.description()));
        category.setIcon(blankToNull(request.icon()));
        category.setImage(showInNavbar ? null : image);
        category.setShowInNavbar(showInNavbar);
        category.setParent(resolveParent(request.parentId(), id));
        return toCategoryTree(categoryRepository.save(category), buildProductCounts());
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        if (!category.getChildren().isEmpty()) {
            throw new BadRequestException("Delete or reassign subcategories before removing this category");
        }
        boolean hasProducts = productRepository.findAll().stream()
                .anyMatch(product -> product.getCategory().getId().equals(id));
        if (hasProducts) {
            throw new BadRequestException("Delete or reassign products before removing this category");
        }
        categoryRepository.delete(category);
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

    private Map<Long, Long> buildProductCounts() {
        Map<Long, Long> directProductCounts = new HashMap<>();
        productRepository.findAll().forEach(product ->
                directProductCounts.merge(product.getCategory().getId(), 1L, Long::sum)
        );
        return directProductCounts;
    }

    private Category resolveParent(Long parentId, Long currentCategoryId) {
        if (parentId == null) {
            return null;
        }
        if (currentCategoryId != null && currentCategoryId.equals(parentId)) {
            throw new BadRequestException("Category cannot be its own parent");
        }
        return categoryRepository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent category not found"));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private void validateUniqueCategory(String name, String slug, Long currentCategoryId) {
        categoryRepository.findByNameIgnoreCase(name)
                .filter(category -> currentCategoryId == null || !category.getId().equals(currentCategoryId))
                .ifPresent(category -> {
                    throw new BadRequestException("Category name already exists");
                });
        categoryRepository.findBySlugIgnoreCase(slug)
                .filter(category -> currentCategoryId == null || !category.getId().equals(currentCategoryId))
                .ifPresent(category -> {
                    throw new BadRequestException("Category slug already exists");
                });
    }
}
