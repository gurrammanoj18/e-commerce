package com.voltmart.ecommerce.dto.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record ProductRequest(
        @NotBlank String slug,
        @NotBlank String name,
        @NotBlank String brand,
        @NotNull Long categoryId,
        @NotNull @DecimalMin("0.0") BigDecimal price,
        @NotNull @DecimalMin("0.0") BigDecimal originalPrice,
        @NotBlank String shortDescription,
        @NotBlank String description,
        Map<String, String> specifications,
        @NotNull Double rating,
        @NotNull Integer reviewCount,
        @NotNull Boolean featured,
        @NotNull Boolean bestSeller,
        @NotNull Boolean newArrival,
        @NotNull Boolean bulkEligible,
        @NotNull Boolean warrantyAvailable,
        @NotNull Boolean replacementAvailable,
        @NotBlank String badge,
        @NotBlank String heroTag,
        List<String> images,
        List<String> tags,
        @NotNull Integer stockQuantity,
        @NotNull Integer lowStockThreshold
) {
}
