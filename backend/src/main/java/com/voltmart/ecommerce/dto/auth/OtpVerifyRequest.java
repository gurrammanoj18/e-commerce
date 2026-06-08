package com.voltmart.ecommerce.dto.auth;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record OtpVerifyRequest(
        @Pattern(regexp = "^(?:\\+?91)?[6-9][0-9]{9}$", message = "Enter a valid 10 digit Indian mobile number")
        String phoneNumber,

        @Pattern(regexp = "^(?:\\+?91)?[6-9][0-9]{9}$", message = "Enter a valid 10 digit Indian mobile number")
        String mobile,

        @NotBlank
        @Pattern(regexp = "^[0-9]{6}$", message = "Enter the 6 digit OTP")
        String otp
) {
    public String resolvedPhoneNumber() {
        return hasText(phoneNumber) ? phoneNumber : mobile;
    }

    @AssertTrue(message = "Enter a valid 10 digit mobile number")
    public boolean isMobileNumberPresent() {
        return hasText(resolvedPhoneNumber());
    }

    private static boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
