package com.voltmart.ecommerce.dto.auth;

import com.voltmart.ecommerce.dto.user.UserResponse;

public record AuthResponse(
        String token,
        UserResponse user
) {
}
