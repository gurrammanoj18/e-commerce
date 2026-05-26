package com.voltmart.ecommerce.dto.auth;

import java.time.LocalDateTime;

public record OtpChallengeResponse(
        String message,
        String email,
        LocalDateTime expiresAt
) {
}
