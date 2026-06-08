package com.voltmart.ecommerce.dto.auth;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Pattern;

public record OtpRequest(
        @Pattern(regexp = "^[0-9]{10}$", message = "Enter a valid 10 digit mobile number")
        String phoneNumber,

        @Pattern(regexp = "^[0-9]{10}$", message = "Enter a valid 10 digit mobile number")
        String mobile
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
