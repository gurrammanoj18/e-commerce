package com.voltmart.ecommerce.dto.product;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record ProductResponse(
        Long id,
        String slug,
        String name,
        String brand,
        String category,
        String categorySlug,
        String subcategory,
        String subcategorySlug,
        Long subcategoryId,
        BigDecimal price,
        BigDecimal originalPrice,
        String shortDescription,
        String description,
        Map<String, String> specifications,
        Double rating,
        Integer reviewCount,
        Integer stockQuantity,
        Boolean lowStock,
        Integer discountPercentage,
        Boolean warrantyAvailable,
        Boolean replacementAvailable,
        Boolean featured,
        Boolean bestSeller,
        Boolean newArrival,
        Boolean bulkEligible,
        String badge,
        String heroTag,
        List<String> images,
        List<String> tags
) {
}
