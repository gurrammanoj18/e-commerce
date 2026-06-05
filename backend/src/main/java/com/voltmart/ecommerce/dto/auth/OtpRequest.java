package com.voltmart.ecommerce.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record OtpRequest(
        @NotBlank
        @Pattern(regexp = "^[0-9]{10}$", message = "Enter a valid 10 digit mobile number")
        String phoneNumber
) {
}
