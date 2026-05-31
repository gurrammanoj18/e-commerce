package com.voltmart.ecommerce.dto.banner;

import com.voltmart.ecommerce.entity.enums.BannerType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AdminBannerRequest(
        String title,
        String subtitle,
        String imageUrl,
        String ctaLabel,
        String ctaHref,
        @NotNull BannerType type,
        @NotNull Integer displayOrder,
        boolean active
) {
}
