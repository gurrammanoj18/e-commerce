package com.voltmart.ecommerce.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record ProfileCompletionRequest(
        @NotBlank String fullName
) {
}
