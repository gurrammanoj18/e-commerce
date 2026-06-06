package com.voltmart.ecommerce.dto.banner;

import jakarta.validation.constraints.NotBlank;

public record AdminBannerRequest(
        @NotBlank String imageUrl,
        String heading
) {
}
