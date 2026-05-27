package com.voltmart.ecommerce.dto.banner;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record BannerRequest(
        @NotBlank String title,
        String subtitle,
        @NotBlank String imageUrl,
        String ctaLabel,
        String ctaHref,
        @NotNull Integer displayOrder,
        boolean active
) {
}
