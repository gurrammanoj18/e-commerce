package com.voltmart.ecommerce.dto.banner;

public record BannerResponse(
        Long id,
        String imageUrl,
        String placement
) {
}
