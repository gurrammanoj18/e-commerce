package com.voltmart.ecommerce.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignupRequest(
        @NotBlank String fullName,
        @Email @NotBlank String email,
        @Size(min = 6) String password
) {
}
