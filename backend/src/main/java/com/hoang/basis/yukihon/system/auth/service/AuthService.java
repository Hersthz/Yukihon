package com.hoang.basis.yukihon.system.auth.service;

import com.hoang.basis.yukihon.system.auth.dto.AuthResponse;
import com.hoang.basis.yukihon.system.auth.dto.ChangePasswordRequest;
import com.hoang.basis.yukihon.system.auth.dto.ForgotPasswordRequest;
import com.hoang.basis.yukihon.system.auth.dto.ForgotPasswordResponse;
import com.hoang.basis.yukihon.system.auth.dto.LoginRequest;
import com.hoang.basis.yukihon.system.auth.dto.RegisterRequest;
import com.hoang.basis.yukihon.system.auth.dto.ResetPasswordRequest;
import com.hoang.basis.yukihon.system.auth.dto.UpdateProfileRequest;
import com.hoang.basis.yukihon.system.user.dto.UserDto;
import com.hoang.basis.yukihon.system.user.entity.RoleName;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import com.hoang.basis.yukihon.system.userlearningstats.service.UserLearningStatsService;
import com.hoang.basis.yukihon.system.usersettings.service.UserSettingsService;
import com.hoang.basis.yukihon.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.regex.Pattern;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserLearningStatsService userLearningStatsService;
    private final UserSettingsService userSettingsService;
    private final PasswordResetEmailService passwordResetEmailService;

    private static final Pattern EMAIL_PATTERN = 
            Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");
    private static final int MIN_PASSWORD_LENGTH = 6;
    private static final int MAX_PASSWORD_LENGTH = 100;
    private static final long PASSWORD_RESET_TOKEN_TTL_SECONDS = 30 * 60;
    private static final String PASSWORD_RESET_MESSAGE =
            "If an account exists for this email, password reset instructions are available.";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Value("${app.auth.expose-reset-token:false}")
    private boolean exposeResetToken;

    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        // Validate email format
        if (!isValidEmail(email)) {
            throw new IllegalArgumentException("Invalid email format");
        }

        // Validate password strength
        if (!isValidPassword(request.getPassword())) {
            throw new IllegalArgumentException(
                    String.format("Password must be between %d and %d characters",
                            MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH)
            );
        }

        // Check if email already exists
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already in use");
        }

        // Validate display name
        if (request.getDisplayName() == null || request.getDisplayName().trim().isEmpty()) {
            throw new IllegalArgumentException("Display name is required");
        }

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .displayName(request.getDisplayName().trim())
                .enabled(true)
                .build();
        user.getRoles().add(RoleName.USER);

        User saved = userRepository.save(user);
        log.info("User registered: {}", email);
        
        // Initialize learning stats for new user
        try {
            userLearningStatsService.initializeStatsForNewUser(saved.getId());
            log.info("Initialized learning stats for new user: {}", email);
        } catch (Exception e) {
            log.warn("Failed to initialize learning stats for user: {}", email, e);
        }

        // Initialize user settings with selected JLPT target level
        try {
            var settings = userSettingsService.initializeSettings(saved.getId());
            if (request.getJlptTargetLevel() != null && !request.getJlptTargetLevel().isBlank()) {
                settings.setTargetJlptLevel(request.getJlptTargetLevel());
            }
            log.info("Initialized settings for new user: {}", email);
        } catch (Exception e) {
            log.warn("Failed to initialize settings for user: {}", email, e);
        }
        
        return buildAuthResponse(saved);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("Login attempt with non-existent email: {}", email);
                    return new BadCredentialsException("Invalid email or password");
                });

        if (!user.isEnabled()) {
            log.warn("Login attempt with disabled account: {}", email);
            throw new BadCredentialsException("Account disabled");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Invalid password attempt for: {}", email);
            throw new BadCredentialsException("Invalid email or password");
        }

        log.info("User logged in: {}", email);
        return buildAuthResponse(user);
    }

    public UserDto getCurrentUser(String email) {
        return UserDto.fromEntity(findUserByEmail(email));
    }

    public UserDto updateProfile(String email, UpdateProfileRequest request) {
        User user = findUserByEmail(email);
        String displayName = request.getDisplayName().trim();

        if (displayName.isBlank()) {
            throw new IllegalArgumentException("Display name is required");
        }

        user.setDisplayName(displayName);
        User saved = userRepository.save(user);
        log.info("Updated profile for user: {}", saved.getEmail());
        return UserDto.fromEntity(saved);
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        User user = findUserByEmail(email);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }

        if (!isValidPassword(request.getNewPassword())) {
            throw new IllegalArgumentException(
                    String.format("Password must be between %d and %d characters",
                            MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH)
            );
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("New password must be different from current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Changed password for user: {}", user.getEmail());
    }

    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String resetToken = null;

        if (isValidEmail(email)) {
            resetToken = userRepository.findByEmail(email)
                    .map(user -> {
                        String token = generateSecureToken();
                        user.setPasswordResetTokenHash(hashToken(token));
                        user.setPasswordResetRequestedAt(Instant.now());
                        user.setPasswordResetExpiresAt(Instant.now().plusSeconds(PASSWORD_RESET_TOKEN_TTL_SECONDS));
                        userRepository.save(user);

                        // Send the reset link by email (or log it in dev when SMTP is not configured).
                        passwordResetEmailService.sendResetLink(email, token);

                        if (exposeResetToken) {
                            log.info("Development password reset token for {}: {}", email, token);
                            return token;
                        }

                        log.info("Password reset requested for {}", email);
                        return null;
                    })
                    .orElse(null);
        }

        return ForgotPasswordResponse.builder()
                .message(PASSWORD_RESET_MESSAGE)
                .resetToken(resetToken)
                .build();
    }

    public void resetPassword(ResetPasswordRequest request) {
        if (!isValidPassword(request.getNewPassword())) {
            throw new IllegalArgumentException(
                    String.format("Password must be between %d and %d characters",
                            MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH)
            );
        }

        String tokenHash = hashToken(request.getToken());
        User user = userRepository.findByPasswordResetTokenHash(tokenHash)
                .orElseThrow(() -> new BadCredentialsException("Invalid or expired password reset token"));

        if (user.getPasswordResetExpiresAt() == null || user.getPasswordResetExpiresAt().isBefore(Instant.now())) {
            clearPasswordResetToken(user);
            userRepository.save(user);
            throw new BadCredentialsException("Invalid or expired password reset token");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("New password must be different from current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        clearPasswordResetToken(user);
        userRepository.save(user);
        log.info("Password reset completed for user: {}", user.getEmail());
    }

    public AuthResponse refreshToken(String refreshToken) {
        String username;
        try {
            username = jwtService.extractUsername(refreshToken);
        } catch (RuntimeException ex) {
            throw new BadCredentialsException("Invalid refresh token");
        }

        User user = userRepository.findByEmail(username.toLowerCase())
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));

        List<SimpleGrantedAuthority> authorities = user.getRoles()
                .stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                .toList();

        var springUser = new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                authorities
        );

        if (!jwtService.isRefreshTokenValid(refreshToken, springUser)) {
            throw new BadCredentialsException("Invalid refresh token");
        }

        return buildAuthResponse(user);
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
                .user(UserDto.fromEntity(user))
                .build();
    }

    private boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }

    private boolean isValidPassword(String password) {
        return password != null 
                && password.length() >= MIN_PASSWORD_LENGTH 
                && password.length() <= MAX_PASSWORD_LENGTH;
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    private String generateSecureToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is not available", ex);
        }
    }

    private void clearPasswordResetToken(User user) {
        user.setPasswordResetTokenHash(null);
        user.setPasswordResetExpiresAt(null);
        user.setPasswordResetRequestedAt(null);
    }
}
