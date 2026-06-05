package com.voltmart.ecommerce.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record OtpVerifyRequest(
        @NotBlank
        @Pattern(regexp = "^[0-9]{10}$", message = "Enter a valid 10 digit mobile number")
        String phoneNumber,

        @NotBlank
        @Pattern(regexp = "^[0-9]{6}$", message = "Enter the 6 digit OTP")
        String otp
) {
}
