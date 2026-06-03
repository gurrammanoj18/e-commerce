package com.voltmart.ecommerce.dto.brandlogo;

public record BrandLogoResponse(
        Long id,
        String brandName,
        String logoUrl,
        Integer displayOrder,
        Boolean active
) {
}
