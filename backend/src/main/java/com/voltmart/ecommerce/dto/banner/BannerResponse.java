package com.voltmart.ecommerce.dto.banner;

public record BannerResponse(
        Long id,
        String title,
        String subtitle,
        String imageUrl,
        String ctaLabel,
        String ctaHref,
        String type,
        Integer displayOrder,
        boolean active
) {
}
