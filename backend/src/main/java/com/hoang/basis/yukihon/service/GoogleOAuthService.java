package com.hoang.basis.yukihon.service;

import com.hoang.basis.yukihon.dto.auth.AuthResponse;
import com.hoang.basis.yukihon.dto.auth.GoogleTokenResponse;
import com.hoang.basis.yukihon.dto.auth.GoogleUserInfo;
import com.hoang.basis.yukihon.model.RoleName;
import com.hoang.basis.yukihon.model.User;
import com.hoang.basis.yukihon.repository.UserRepository;
import com.hoang.basis.yukihon.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class GoogleOAuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RestTemplate restTemplate;

    @Value("${google.client-id}")
    private String googleClientId;

    @Value("${google.client-secret}")
    private String googleClientSecret;

    @Value("${google.redirect-uri}")
    private String googleRedirectUri;

    private static final String GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
    private static final String GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

    public AuthResponse authenticateWithGoogle(String code) {
        try {
            // 1. Exchange code for tokens
            GoogleTokenResponse tokenResponse = exchangeCodeForToken(code);
            
            if (tokenResponse.getError() != null) {
                throw new IllegalArgumentException("Google OAuth Error: " + tokenResponse.getErrorDescription());
            }

            // 2. Get user info from Google
            GoogleUserInfo googleUserInfo = getUserInfo(tokenResponse.getAccessToken());

            // 3. Find or create user
            User user = userRepository.findByEmail(googleUserInfo.getEmail().toLowerCase())
                    .orElseGet(() -> createUserFromGoogleInfo(googleUserInfo));

            // 4. Return auth response
            return buildAuthResponse(user);
        } catch (Exception e) {
            log.error("Google OAuth error", e);
            throw new IllegalArgumentException("Failed to authenticate with Google: " + e.getMessage());
        }
    }

    private GoogleTokenResponse exchangeCodeForToken(String code) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("code", code);
            body.add("client_id", googleClientId);
            body.add("client_secret", googleClientSecret);
            body.add("redirect_uri", googleRedirectUri);
            body.add("grant_type", "authorization_code");

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
            ResponseEntity<GoogleTokenResponse> response = restTemplate.postForEntity(
                    GOOGLE_TOKEN_URL,
                    request,
                    GoogleTokenResponse.class
            );

            return response.getBody();
        } catch (Exception e) {
            log.error("Error exchanging code for token", e);
            throw new RuntimeException("Failed to exchange code for token", e);
        }
    }

    private GoogleUserInfo getUserInfo(String accessToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);

            HttpEntity<?> request = new HttpEntity<>(headers);
            ResponseEntity<GoogleUserInfo> response = restTemplate.getForEntity(
                    GOOGLE_USERINFO_URL,
                    GoogleUserInfo.class,
                    request
            );

            return response.getBody();
        } catch (Exception e) {
            log.error("Error getting user info from Google", e);
            throw new RuntimeException("Failed to get user info", e);
        }
    }

    private User createUserFromGoogleInfo(GoogleUserInfo googleUserInfo) {
        User user = User.builder()
                .email(googleUserInfo.getEmail().toLowerCase())
                .displayName(googleUserInfo.getName())
                .password("") // Google OAuth users don't have password
                .enabled(true)
                .build();
        
        user.getRoles().add(RoleName.USER);
        return userRepository.save(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        List<SimpleGrantedAuthority> authorities = user.getRoles()
                .stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                .toList();

        var springUser = new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                authorities
        );

        String accessToken = jwtService.generateAccessToken(springUser);
        String refreshToken = jwtService.generateRefreshToken(springUser);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(com.hoang.basis.yukihon.dto.user.UserDto.fromEntity(user))
                .build();
    }
}
