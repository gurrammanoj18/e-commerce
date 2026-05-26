package com.voltmart.ecommerce.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record OtpVerifyRequest(
        @NotBlank
        @Email(message = "Enter a valid email address")
        String email,
        @NotBlank
        @Pattern(regexp = "^[0-9]{6}$", message = "OTP must be 6 digits")
        String otpCode
) {
}
