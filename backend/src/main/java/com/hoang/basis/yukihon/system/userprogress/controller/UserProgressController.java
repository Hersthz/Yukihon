package com.hoang.basis.yukihon.system.userprogress.controller;

import com.hoang.basis.yukihon.system.userprogress.dto.UserProgressDto;
import com.hoang.basis.yukihon.system.userprogress.dto.UserProgressRequest;
import com.hoang.basis.yukihon.system.userprogress.service.UserProgressService;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.frontend-url:http://localhost:5173}")
public class UserProgressController {

    private final UserProgressService userProgressService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<UserProgressDto>> getUserProgress(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long currentUserId = resolveCurrentUserId(userDetails);
        return ResponseEntity.ok(userProgressService.getUserProgress(currentUserId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProgressDto> getProgressById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long currentUserId = resolveCurrentUserId(userDetails);
        boolean isAdmin = isAdmin(userDetails);
        return ResponseEntity.ok(userProgressService.getProgressByIdForUser(id, currentUserId, isAdmin));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserProgressDto>> getUserProgressById(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        assertCanAccessUser(userDetails, userId);
        List<UserProgressDto> progress = userProgressService.getUserProgress(userId);
        return ResponseEntity.ok(progress);
    }

    @GetMapping("/user/{userId}/status/{status}")
    public ResponseEntity<List<UserProgressDto>> getUserProgressByStatus(
            @PathVariable Long userId,
            @PathVariable String status,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        assertCanAccessUser(userDetails, userId);
        List<UserProgressDto> progress = userProgressService.getUserProgressByStatus(userId, status);
        return ResponseEntity.ok(progress);
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<UserProgressDto> createProgress(
            @PathVariable Long userId,
            @Valid @RequestBody UserProgressRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        assertCanAccessUser(userDetails, userId);
        UserProgressDto progress = userProgressService.createProgress(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(progress);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserProgressDto> updateProgress(
            @PathVariable Long id,
            @Valid @RequestBody UserProgressRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long currentUserId = resolveCurrentUserId(userDetails);
        boolean isAdmin = isAdmin(userDetails);
        UserProgressDto updated = userProgressService.updateProgressForUser(id, request, currentUserId, isAdmin);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProgress(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long currentUserId = resolveCurrentUserId(userDetails);
        boolean isAdmin = isAdmin(userDetails);
        userProgressService.deleteProgressForUser(id, currentUserId, isAdmin);
        return ResponseEntity.noContent().build();
    }

    private Long resolveCurrentUserId(UserDetails userDetails) {
        if (userDetails == null || userDetails.getUsername() == null) {
            throw new AccessDeniedException("Authentication required");
        }

        return userRepository.findByEmail(userDetails.getUsername().toLowerCase())
                .map(user -> user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private boolean isAdmin(UserDetails userDetails) {
        return userDetails != null && userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
    }

    private void assertCanAccessUser(UserDetails userDetails, Long targetUserId) {
        Long currentUserId = resolveCurrentUserId(userDetails);
        if (currentUserId.equals(targetUserId) || isAdmin(userDetails)) {
            return;
        }
        throw new AccessDeniedException("Access denied");
    }
}
