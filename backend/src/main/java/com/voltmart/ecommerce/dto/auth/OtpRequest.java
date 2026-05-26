package com.voltmart.ecommerce.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record OtpRequest(
        @NotBlank
        @Email(message = "Enter a valid email address")
        String email
) {
}
