package com.voltmart.ecommerce.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record Msg91WidgetVerifyRequest(
        @NotBlank String accessToken
) {
}
