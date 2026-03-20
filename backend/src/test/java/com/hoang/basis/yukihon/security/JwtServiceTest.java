package com.hoang.basis.yukihon.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;

import java.util.Base64;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    private static final String SECRET = Base64.getEncoder().encodeToString(
            "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef".getBytes()
    );

    @Test
    void shouldGenerateAndValidateAccessToken() {
        // Arrange
        JwtService jwtService = new JwtService(SECRET, 60_000L, 120_000L);
        jwtService.initKey();
        User user = new User("user@yukihon.dev", "hashed", List.of());

        // Act
        String accessToken = jwtService.generateAccessToken(user);

        // Assert
        assertTrue(jwtService.isAccessToken(accessToken));
        assertTrue(jwtService.isAccessTokenValid(accessToken, user));
        assertFalse(jwtService.isRefreshTokenValid(accessToken, user));
    }

    @Test
    void shouldGenerateRefreshTokenAndRejectAsAccessToken() {
        // Arrange
        JwtService jwtService = new JwtService(SECRET, 60_000L, 120_000L);
        jwtService.initKey();
        User user = new User("user@yukihon.dev", "hashed", List.of());

        // Act
        String refreshToken = jwtService.generateRefreshToken(user);

        // Assert
        assertFalse(jwtService.isAccessToken(refreshToken));
        assertTrue(jwtService.isRefreshTokenValid(refreshToken, user));
        assertFalse(jwtService.isAccessTokenValid(refreshToken, user));
    }
}
