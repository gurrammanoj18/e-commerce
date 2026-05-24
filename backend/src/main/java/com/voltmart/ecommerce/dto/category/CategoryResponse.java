package com.voltmart.ecommerce.dto.category;

public record CategoryResponse(
        Long id,
        String name,
        String slug,
        String description,
        String icon,
        long productCount
) {
}
