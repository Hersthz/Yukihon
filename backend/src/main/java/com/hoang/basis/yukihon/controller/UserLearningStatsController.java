package com.hoang.basis.yukihon.controller;

import com.hoang.basis.yukihon.dto.stats.UserLearningStatsDto;
import com.hoang.basis.yukihon.service.UserLearningStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.frontend-url:http://localhost:5173}")
public class UserLearningStatsController {

    private final UserLearningStatsService userLearningStatsService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<UserLearningStatsDto> getStats(@PathVariable Long userId) {
        UserLearningStatsDto stats = userLearningStatsService.getStatsByUserId(userId);
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/user/{userId}/initialize")
    public ResponseEntity<UserLearningStatsDto> initializeStats(@PathVariable Long userId) {
        UserLearningStatsDto stats = userLearningStatsService.initializeStatsForNewUser(userId);
        return ResponseEntity.ok(stats);
    }

    @PutMapping("/user/{userId}/xp/{xpGained}")
    public ResponseEntity<UserLearningStatsDto> updateXP(
            @PathVariable Long userId,
            @PathVariable Integer xpGained
    ) {
        UserLearningStatsDto stats = userLearningStatsService.updateXP(userId, xpGained);
        return ResponseEntity.ok(stats);
    }

    @PutMapping("/user/{userId}/streak")
    public ResponseEntity<UserLearningStatsDto> updateStreak(@PathVariable Long userId) {
        UserLearningStatsDto stats = userLearningStatsService.updateStreak(userId);
        return ResponseEntity.ok(stats);
    }

    @PutMapping("/user/{userId}/target-level/{level}")
    public ResponseEntity<UserLearningStatsDto> updateTargetLevel(
            @PathVariable Long userId,
            @PathVariable String level
    ) {
        UserLearningStatsDto stats = userLearningStatsService.updateTargetLevel(userId, level);
        return ResponseEntity.ok(stats);
    }
}
