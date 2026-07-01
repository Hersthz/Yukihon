package com.hoang.basis.yukihon.system.analytics.controller;

import com.hoang.basis.yukihon.base.security.CurrentUserId;
import com.hoang.basis.yukihon.system.analytics.dto.LearningAnalyticsEventRequest;
import com.hoang.basis.yukihon.system.analytics.dto.LearningFunnelDto;
import com.hoang.basis.yukihon.system.analytics.dto.StudyCalendarDto;
import com.hoang.basis.yukihon.system.analytics.service.LearningAnalyticsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @PostMapping("/analytics/events")
    public ResponseEntity<Void> trackLearningEvent(
            @Valid @RequestBody LearningAnalyticsEventRequest request, @CurrentUserId Long userId) {
        learningAnalyticsService.trackEvent(userId, request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/analytics/study-calendar")
    public ResponseEntity<StudyCalendarDto> getStudyCalendar(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @CurrentUserId Long userId) {
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
            @RequestParam(required = false) String endDate) {
        return ResponseEntity.ok(
                learningAnalyticsService.getLearningFunnel(days, limit, contentType, jlptLevel, startDate, endDate));
    }
}
