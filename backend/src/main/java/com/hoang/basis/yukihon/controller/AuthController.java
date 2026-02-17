package com.hoang.basis.yukihon.controller;

import com.hoang.basis.yukihon.dto.auth.AuthResponse;
import com.hoang.basis.yukihon.dto.auth.GoogleTokenRequest;
import com.hoang.basis.yukihon.dto.auth.LoginRequest;
import com.hoang.basis.yukihon.dto.auth.RegisterRequest;
import com.hoang.basis.yukihon.dto.user.UserDto;
import com.hoang.basis.yukihon.service.AuthService;
import com.hoang.basis.yukihon.service.GoogleOAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/me")
    public ResponseEntity<UserDto> me(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserDto dto = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> authenticateWithGoogle(
            @Valid @RequestBody GoogleTokenRequest request
    ) {
        AuthResponse response = googleOAuthService.authenticateWithGoogle(request.getCode());
        return ResponseEntity.ok(response);
    }
}
