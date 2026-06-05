package com.voltmart.ecommerce.security;

import com.voltmart.ecommerce.config.AppProperties;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtServiceTest {

    @Test
    void rejectsMissingSecret() {
        AppProperties properties = new AppProperties();
        properties.getJwt().setSecret("   ");
        properties.getJwt().setExpiration(86400000L);

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> new JwtService(properties)
        );

        assertEquals("APP_JWT_SECRET is required.", exception.getMessage());
    }

    @Test
    void rejectsShortSecret() {
        AppProperties properties = new AppProperties();
        properties.getJwt().setSecret("short-secret");
        properties.getJwt().setExpiration(86400000L);

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> new JwtService(properties)
        );

        assertEquals("JWT secret must be at least 32 characters / 256 bits.", exception.getMessage());
    }

    @Test
    void acceptsStrongSecret() {
        AppProperties properties = new AppProperties();
        properties.getJwt().setSecret("DummyLocalSecretKey1234567890123456");
        properties.getJwt().setExpiration(86400000L);

        assertDoesNotThrow(() -> new JwtService(properties));
    }
}
