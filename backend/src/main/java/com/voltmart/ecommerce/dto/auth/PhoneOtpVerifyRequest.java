package com.voltmart.ecommerce.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record PhoneOtpVerifyRequest(
        @NotBlank
        @Pattern(regexp = "^\\d{10}$", message = "Mobile number must be exactly 10 digits")
        String phoneNumber,
        @NotBlank
        @Pattern(regexp = "^\\d{6}$", message = "OTP must be exactly 6 digits")
        String otp
) {
}
