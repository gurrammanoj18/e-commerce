package com.voltmart.ecommerce.dto.brandlogo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record BrandLogoRequest(
        @NotBlank String brandName,
        @NotBlank String logoUrl,
        @NotNull Integer displayOrder,
        @NotNull Boolean active
) {
}
