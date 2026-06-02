package com.voltmart.ecommerce.dto.category;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CategoryResponse(
        Long id,
        String name,
        String slug,
        String description,
        String icon,
        String image,
        @JsonProperty("showInNavbar")
        boolean showInNavbar,
        Long parentId,
        boolean leaf,
        long productCount,
        java.util.List<CategoryResponse> subcategories
) {
}
