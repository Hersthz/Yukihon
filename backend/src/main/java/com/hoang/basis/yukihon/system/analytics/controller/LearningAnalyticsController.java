package com.hoang.basis.yukihon.system.analytics.controller;

import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.system.analytics.dto.LearningAnalyticsEventRequest;
import com.hoang.basis.yukihon.system.analytics.dto.LearningFunnelDto;
import com.hoang.basis.yukihon.system.analytics.dto.StudyCalendarDto;
import com.hoang.basis.yukihon.system.analytics.service.LearningAnalyticsService;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.frontend-url:http://localhost:5173}")
public class LearningAnalyticsController {

    private final LearningAnalyticsService learningAnalyticsService;
    private final UserRepository userRepository;

    @PostMapping("/analytics/events")
    public ResponseEntity<Void> trackLearningEvent(
            @Valid @RequestBody LearningAnalyticsEventRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = resolveCurrentUserId(userDetails);
        learningAnalyticsService.trackEvent(userId, request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/analytics/study-calendar")
    public ResponseEntity<StudyCalendarDto> getStudyCalendar(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = resolveCurrentUserId(userDetails);
        return ResponseEntity.ok(learningAnalyticsService.getStudyCalendar(userId, startDate, endDate));
    }

    @GetMapping("/admin/analytics/learning-funnel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LearningFunnelDto> getLearningFunnel(
            @RequestParam(defaultValue = "30") int days,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "LESSON") String contentType,
            @RequestParam(required = false) String jlptLevel,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        return ResponseEntity.ok(
                learningAnalyticsService.getLearningFunnel(days, limit, contentType, jlptLevel, startDate, endDate)
        );
    }

    private Long resolveCurrentUserId(UserDetails userDetails) {
        if (userDetails == null || userDetails.getUsername() == null) {
            throw new AccessDeniedException("Authentication required");
        }

        return userRepository.findByEmail(userDetails.getUsername().toLowerCase())
                .map(user -> user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
