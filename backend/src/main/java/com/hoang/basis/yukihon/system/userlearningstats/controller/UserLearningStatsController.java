package com.hoang.basis.yukihon.system.userlearningstats.controller;

import com.hoang.basis.yukihon.system.userlearningstats.dto.UserLearningStatsDto;
import com.hoang.basis.yukihon.system.userlearningstats.service.UserLearningStatsService;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.frontend-url:http://localhost:5173}")
public class UserLearningStatsController {

    private final UserLearningStatsService userLearningStatsService;
    private final UserRepository userRepository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<UserLearningStatsDto> getStats(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        assertCanAccessUser(userDetails, userId);
        UserLearningStatsDto stats = userLearningStatsService.getStatsByUserId(userId);
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/user/{userId}/initialize")
    public ResponseEntity<UserLearningStatsDto> initializeStats(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        assertCanAccessUser(userDetails, userId);
        UserLearningStatsDto stats = userLearningStatsService.initializeStatsForNewUser(userId);
        return ResponseEntity.ok(stats);
    }

    @PutMapping("/user/{userId}/xp/{xpGained}")
    public ResponseEntity<UserLearningStatsDto> updateXP(
            @PathVariable Long userId,
            @PathVariable Integer xpGained,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        assertCanAccessUser(userDetails, userId);
        UserLearningStatsDto stats = userLearningStatsService.updateXP(userId, xpGained);
        return ResponseEntity.ok(stats);
    }

    @PutMapping("/user/{userId}/streak")
    public ResponseEntity<UserLearningStatsDto> updateStreak(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        assertCanAccessUser(userDetails, userId);
        UserLearningStatsDto stats = userLearningStatsService.updateStreak(userId);
        return ResponseEntity.ok(stats);
    }

    @PutMapping("/user/{userId}/target-level/{level}")
    public ResponseEntity<UserLearningStatsDto> updateTargetLevel(
            @PathVariable Long userId,
            @PathVariable String level,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        assertCanAccessUser(userDetails, userId);
        UserLearningStatsDto stats = userLearningStatsService.updateTargetLevel(userId, level);
        return ResponseEntity.ok(stats);
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
