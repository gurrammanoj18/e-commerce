package com.voltmart.ecommerce.dto.user;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        String phoneNumber,
        Boolean mobileVerified,
        String profileImageUrl,
        String role,
        String preferredDeliveryMode,
        java.math.BigDecimal walletBalance
) {
}
