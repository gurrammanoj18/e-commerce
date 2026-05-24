package com.voltmart.ecommerce.dto.user;

import java.time.LocalDateTime;

public record AdminUserResponse(
        Long id,
        String fullName,
        String email,
        String role,
        LocalDateTime createdAt
) {
}
