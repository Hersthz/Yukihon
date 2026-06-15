package com.hoang.basis.yukihon.system.auth.controller;

import com.hoang.basis.yukihon.system.auth.dto.AuthResponse;
import com.hoang.basis.yukihon.system.auth.dto.ChangePasswordRequest;
import com.hoang.basis.yukihon.system.auth.dto.ForgotPasswordRequest;
import com.hoang.basis.yukihon.system.auth.dto.ForgotPasswordResponse;
import com.hoang.basis.yukihon.system.auth.dto.GoogleTokenRequest;
import com.hoang.basis.yukihon.system.auth.dto.LoginRequest;
import com.hoang.basis.yukihon.system.auth.dto.RefreshTokenRequest;
import com.hoang.basis.yukihon.system.auth.dto.RegisterRequest;
import com.hoang.basis.yukihon.system.auth.dto.ResetPasswordRequest;
import com.hoang.basis.yukihon.system.auth.dto.UpdateProfileRequest;
import com.hoang.basis.yukihon.system.user.dto.UserDto;
import com.hoang.basis.yukihon.system.auth.service.AuthService;
import com.hoang.basis.yukihon.system.auth.service.GoogleOAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final GoogleOAuthService googleOAuthService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @Valid @RequestBody RefreshTokenRequest request
    ) {
        AuthResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ForgotPasswordResponse> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request
    ) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request
    ) {
        authService.resetPassword(request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> me(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserDto dto = authService.getCurrentUser(userDetails.getUsername());
        dto.setPermissions(userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(authority -> !authority.startsWith("ROLE_"))
                .collect(Collectors.toSet()));
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(authService.updateProfile(userDetails.getUsername(), request));
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        authService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> authenticateWithGoogle(
            @Valid @RequestBody GoogleTokenRequest request
    ) {
        AuthResponse response = googleOAuthService.authenticateWithGoogle(request.getCode(), request.getRedirectUri());
        return ResponseEntity.ok(response);
    }
}
