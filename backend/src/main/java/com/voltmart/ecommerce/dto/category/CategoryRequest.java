package com.voltmart.ecommerce.dto.category;

import jakarta.validation.constraints.NotBlank;

public record CategoryRequest(
        @NotBlank String name,
        @NotBlank String slug,
        String description,
        String icon,
        Long parentId,
        String image
) {
}
