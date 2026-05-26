package com.voltmart.ecommerce.dto.user;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        String phoneNumber,
        String role
) {
}
