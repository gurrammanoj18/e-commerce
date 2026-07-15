package com.voltmart.ecommerce.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record PhoneOtpRequest(
        @NotBlank
        @Pattern(regexp = "^\\d{10}$", message = "Mobile number must be exactly 10 digits")
        String phoneNumber
) {
}
