package com.voltmart.ecommerce.dto.category;

public record CategoryResponse(
        Long id,
        String name,
        String slug,
        String description,
        String icon,
        String image,
        Long parentId,
        boolean leaf,
        long productCount,
        java.util.List<CategoryResponse> subcategories
) {
}
