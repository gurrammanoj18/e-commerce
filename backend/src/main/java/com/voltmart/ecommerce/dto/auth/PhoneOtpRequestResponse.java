package com.voltmart.ecommerce.dto.auth;

public record PhoneOtpRequestResponse(
        String phoneNumber,
        int expiresInSeconds,
        boolean sent
) {
}
