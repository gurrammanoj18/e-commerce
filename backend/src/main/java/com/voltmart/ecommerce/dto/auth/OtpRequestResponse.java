package com.voltmart.ecommerce.dto.auth;

public record OtpRequestResponse(
        String phoneNumber,
        String message,
        Integer expiresInSeconds,
        String demoOtp
) {
}
