package com.hoang.basis.yukihon.service;

import com.hoang.basis.yukihon.dto.auth.AuthResponse;
import com.hoang.basis.yukihon.dto.auth.LoginRequest;
import com.hoang.basis.yukihon.dto.auth.RegisterRequest;
import com.hoang.basis.yukihon.dto.user.UserDto;
import com.hoang.basis.yukihon.model.RoleName;
import com.hoang.basis.yukihon.model.User;
import com.hoang.basis.yukihon.repository.UserRepository;
import com.hoang.basis.yukihon.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    private static final Pattern EMAIL_PATTERN = 
            Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");
    private static final int MIN_PASSWORD_LENGTH = 6;
    private static final int MAX_PASSWORD_LENGTH = 100;

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
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return UserDto.fromEntity(user);
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
}
