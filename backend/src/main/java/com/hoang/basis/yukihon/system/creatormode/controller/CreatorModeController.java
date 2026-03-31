package com.hoang.basis.yukihon.system.creatormode.controller;

import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.system.creatormode.dto.CreatorTemplateAnalyticsDto;
import com.hoang.basis.yukihon.system.creatormode.dto.CreatorTemplateDto;
import com.hoang.basis.yukihon.system.creatormode.dto.CreatorTemplateMetricsRequest;
import com.hoang.basis.yukihon.system.creatormode.dto.CreatorTemplateReviewRequest;
import com.hoang.basis.yukihon.system.creatormode.dto.CreatorTemplateUpsertRequest;
import com.hoang.basis.yukihon.system.creatormode.service.CreatorModeService;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/creator-mode")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.frontend-url:http://localhost:5173}")
@Slf4j
public class CreatorModeController {

    private final CreatorModeService creatorModeService;
    private final UserRepository userRepository;

    @GetMapping("/templates")
    @PreAuthorize("hasAnyAuthority('CONTENT_READ','CONTENT_MANAGE')")
    public ResponseEntity<List<CreatorTemplateDto>> getTemplates(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String contentType
    ) {
        return ResponseEntity.ok(creatorModeService.getTemplates(status, contentType));
    }

    @GetMapping("/templates/{id}")
    @PreAuthorize("hasAnyAuthority('CONTENT_READ','CONTENT_MANAGE')")
    public ResponseEntity<CreatorTemplateDto> getTemplate(@PathVariable Long id) {
        return ResponseEntity.ok(creatorModeService.getTemplate(id));
    }

    @PostMapping("/templates")
    @PreAuthorize("hasAuthority('CONTENT_MANAGE')")
    public ResponseEntity<CreatorTemplateDto> createTemplate(
            @Valid @RequestBody CreatorTemplateUpsertRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long actorUserId = resolveCurrentUserId(userDetails);
        CreatorTemplateDto created = creatorModeService.createTemplate(request, actorUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/templates/{id}")
    @PreAuthorize("hasAuthority('CONTENT_MANAGE')")
    public ResponseEntity<CreatorTemplateDto> updateTemplate(
            @PathVariable Long id,
            @Valid @RequestBody CreatorTemplateUpsertRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long actorUserId = resolveCurrentUserId(userDetails);
        CreatorTemplateDto updated = creatorModeService.updateTemplate(id, request, actorUserId, isAdmin(userDetails));
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/templates/{id}/submit")
    @PreAuthorize("hasAuthority('CONTENT_MANAGE')")
    public ResponseEntity<CreatorTemplateDto> submitForReview(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long actorUserId = resolveCurrentUserId(userDetails);
        CreatorTemplateDto updated = creatorModeService.submitForReview(id, actorUserId, isAdmin(userDetails));
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/templates/{id}/review")
    @PreAuthorize("hasAuthority('CONTENT_MANAGE')")
    public ResponseEntity<CreatorTemplateDto> reviewTemplate(
            @PathVariable Long id,
            @Valid @RequestBody CreatorTemplateReviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long reviewerUserId = resolveCurrentUserId(userDetails);
        CreatorTemplateDto updated = creatorModeService.reviewTemplate(id, request, reviewerUserId);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/templates/{id}/metrics")
    @PreAuthorize("hasAuthority('CONTENT_MANAGE')")
    public ResponseEntity<CreatorTemplateDto> recordMetrics(
            @PathVariable Long id,
            @Valid @RequestBody CreatorTemplateMetricsRequest request
    ) {
        CreatorTemplateDto updated = creatorModeService.recordMetrics(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/templates/{id}")
    @PreAuthorize("hasAuthority('CONTENT_MANAGE')")
    public ResponseEntity<Void> deleteTemplate(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long actorUserId = resolveCurrentUserId(userDetails);
        creatorModeService.deleteTemplate(id, actorUserId, isAdmin(userDetails));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/review-queue")
    @PreAuthorize("hasAuthority('CONTENT_MANAGE')")
    public ResponseEntity<List<CreatorTemplateDto>> getReviewQueue() {
        return ResponseEntity.ok(creatorModeService.getTemplates("PENDING_REVIEW", null));
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasAnyAuthority('CONTENT_READ','CONTENT_MANAGE')")
    public ResponseEntity<CreatorTemplateAnalyticsDto> getAnalytics() {
        return ResponseEntity.ok(creatorModeService.getAnalytics());
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
}
