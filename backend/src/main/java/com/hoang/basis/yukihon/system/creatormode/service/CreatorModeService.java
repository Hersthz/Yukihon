package com.hoang.basis.yukihon.system.creatormode.service;

import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.system.creatormode.dto.CreatorTemplateAnalyticsDto;
import com.hoang.basis.yukihon.system.creatormode.dto.CreatorTemplateAnalyticsItemDto;
import com.hoang.basis.yukihon.system.creatormode.dto.CreatorTemplateAuditEventDto;
import com.hoang.basis.yukihon.system.creatormode.dto.CreatorTemplateDto;
import com.hoang.basis.yukihon.system.creatormode.dto.CreatorTemplateMetricsRequest;
import com.hoang.basis.yukihon.system.creatormode.dto.CreatorTemplateReviewRequest;
import com.hoang.basis.yukihon.system.creatormode.dto.CreatorTemplateUpsertRequest;
import com.hoang.basis.yukihon.system.creatormode.entity.CreatorTemplateAuditEvent;
import com.hoang.basis.yukihon.system.creatormode.entity.CreatorTemplate;
import com.hoang.basis.yukihon.system.creatormode.repository.CreatorTemplateAuditEventRepository;
import com.hoang.basis.yukihon.system.creatormode.repository.CreatorTemplateRepository;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CreatorModeService {

    private static final Set<String> VALID_JLPT_LEVELS = Set.of("N5", "N4", "N3", "N2", "N1");
    private static final String SYSTEM_ACTOR_TOKEN = "SYSTEM";

    private final CreatorTemplateRepository creatorTemplateRepository;
    private final CreatorTemplateAuditEventRepository creatorTemplateAuditEventRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CreatorTemplateDto> getTemplates(String status, String contentType) {
        CreatorTemplate.TemplateStatus parsedStatus = parseStatus(status, false);
        CreatorTemplate.ContentType parsedType = parseContentType(contentType, false);

        List<CreatorTemplate> templates;
        if (parsedStatus != null && parsedType != null) {
            templates = creatorTemplateRepository.findByStatusAndContentTypeOrderByUpdatedAtDesc(parsedStatus, parsedType);
        } else if (parsedStatus != null) {
            templates = creatorTemplateRepository.findByStatusOrderByUpdatedAtDesc(parsedStatus);
        } else if (parsedType != null) {
            templates = creatorTemplateRepository.findByContentTypeOrderByUpdatedAtDesc(parsedType);
        } else {
            templates = creatorTemplateRepository.findAllByOrderByUpdatedAtDesc();
        }

        return templates.stream().map(CreatorTemplateDto::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public CreatorTemplateDto getTemplate(Long id) {
        CreatorTemplate template = creatorTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Creator template not found with id: " + id));
        return CreatorTemplateDto.fromEntity(template);
    }

    @Transactional(readOnly = true)
    public List<CreatorTemplateAuditEventDto> getTemplateAuditTimeline(Long id, String stage, String actor) {
        creatorTemplateRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Creator template not found with id: " + id));

        CreatorTemplateAuditEvent.AuditStage stageFilter = parseAuditStage(stage);
        AuditActorFilter actorFilter = parseAuditActorFilter(actor);

        List<CreatorTemplateAuditEvent> events;
        if (stageFilter != null && actorFilter.type() == AuditActorType.SYSTEM) {
            events = creatorTemplateAuditEventRepository
                    .findByTemplateIdAndStageAndActorUserIdIsNullOrderByCreatedAtAscIdAsc(id, stageFilter);
        } else if (stageFilter != null && actorFilter.type() == AuditActorType.USER) {
            events = creatorTemplateAuditEventRepository
                    .findByTemplateIdAndStageAndActorUserIdOrderByCreatedAtAscIdAsc(id, stageFilter, actorFilter.actorUserId());
        } else if (stageFilter != null) {
            events = creatorTemplateAuditEventRepository.findByTemplateIdAndStageOrderByCreatedAtAscIdAsc(id, stageFilter);
        } else if (actorFilter.type() == AuditActorType.SYSTEM) {
            events = creatorTemplateAuditEventRepository.findByTemplateIdAndActorUserIdIsNullOrderByCreatedAtAscIdAsc(id);
        } else if (actorFilter.type() == AuditActorType.USER) {
            events = creatorTemplateAuditEventRepository
                    .findByTemplateIdAndActorUserIdOrderByCreatedAtAscIdAsc(id, actorFilter.actorUserId());
        } else {
            events = creatorTemplateAuditEventRepository.findByTemplateIdOrderByCreatedAtAscIdAsc(id);
        }

        return events
            .stream()
            .map(CreatorTemplateAuditEventDto::fromEntity)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<CreatorTemplateDto> getReviewerQueue() {
        return creatorTemplateRepository.findByStatusOrderByUpdatedAtDesc(CreatorTemplate.TemplateStatus.PENDING_REVIEW)
                .stream()
                .map(CreatorTemplateDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CreatorTemplateDto> getAdminQueue() {
        return creatorTemplateRepository.findByStatusOrderByUpdatedAtDesc(CreatorTemplate.TemplateStatus.APPROVED)
                .stream()
                .map(CreatorTemplateDto::fromEntity)
                .toList();
    }

    public CreatorTemplateDto createTemplate(CreatorTemplateUpsertRequest request, Long actorUserId) {
        User actor = findUserByIdOrThrow(actorUserId);

        CreatorTemplate template = CreatorTemplate.builder()
                .title(request.getTitle().trim())
                .summary(trimToNull(request.getSummary()))
                .contentType(parseContentType(request.getContentType(), true))
                .status(CreatorTemplate.TemplateStatus.DRAFT)
                .jlptLevel(normalizeJlptLevel(request.getJlptLevel()))
                .tags(trimToNull(request.getTags()))
                .estimatedMinutes(resolveEstimatedMinutes(request.getEstimatedMinutes()))
                .builderJson(request.getBuilderJson().trim())
                .createdBy(actor)
                .build();

        CreatorTemplate saved = creatorTemplateRepository.save(template);
        appendAuditEvent(saved, actor, CreatorTemplateAuditEvent.AuditStage.AUTHORING,
            CreatorTemplateAuditEvent.AuditAction.CREATED, null, "Template draft created");
        log.info("Creator template created: id={}, actorUserId={}", saved.getId(), actorUserId);
        return CreatorTemplateDto.fromEntity(saved);
    }

    public CreatorTemplateDto updateTemplate(Long id, CreatorTemplateUpsertRequest request, Long actorUserId, boolean isAdmin) {
        CreatorTemplate template = findEditableTemplate(id, actorUserId, isAdmin);
        User actor = findUserByIdOrThrow(actorUserId);

        template.setTitle(request.getTitle().trim());
        template.setSummary(trimToNull(request.getSummary()));
        template.setContentType(parseContentType(request.getContentType(), true));
        template.setJlptLevel(normalizeJlptLevel(request.getJlptLevel()));
        template.setTags(trimToNull(request.getTags()));
        template.setEstimatedMinutes(resolveEstimatedMinutes(request.getEstimatedMinutes()));
        template.setBuilderJson(request.getBuilderJson().trim());

        if (template.getStatus() == CreatorTemplate.TemplateStatus.REJECTED) {
            template.setStatus(CreatorTemplate.TemplateStatus.DRAFT);
        }

        CreatorTemplate updated = creatorTemplateRepository.save(template);
    appendAuditEvent(updated, actor, CreatorTemplateAuditEvent.AuditStage.AUTHORING,
        CreatorTemplateAuditEvent.AuditAction.UPDATED_DRAFT, null, null);
        log.info("Creator template updated: id={}, actorUserId={}", id, actorUserId);
        return CreatorTemplateDto.fromEntity(updated);
    }

    public CreatorTemplateDto submitForReview(Long id, Long actorUserId, boolean isAdmin) {
        CreatorTemplate template = findEditableTemplate(id, actorUserId, isAdmin);
        User actor = findUserByIdOrThrow(actorUserId);

        if (template.getStatus() == CreatorTemplate.TemplateStatus.PUBLISHED) {
            throw new IllegalStateException("Published template cannot be submitted for review");
        }

        template.setStatus(CreatorTemplate.TemplateStatus.PENDING_REVIEW);
        template.setReviewedBy(null);
        template.setReviewNote(null);
        template.setReviewedAt(null);
        clearAdminReview(template);

        CreatorTemplate saved = creatorTemplateRepository.save(template);
    appendAuditEvent(saved, actor, CreatorTemplateAuditEvent.AuditStage.REVIEW_SUBMISSION,
        CreatorTemplateAuditEvent.AuditAction.SUBMITTED_FOR_REVIEW,
        CreatorTemplate.TemplateStatus.PENDING_REVIEW.name(), null);
        log.info("Creator template submitted for review: id={}, actorUserId={}", id, actorUserId);
        return CreatorTemplateDto.fromEntity(saved);
    }

    public CreatorTemplateDto reviewByReviewer(Long id, CreatorTemplateReviewRequest request, Long reviewerUserId) {
        CreatorTemplate template = creatorTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Creator template not found with id: " + id));

        if (template.getStatus() != CreatorTemplate.TemplateStatus.PENDING_REVIEW) {
            throw new IllegalStateException("Template must be in PENDING_REVIEW before reviewer decision");
        }

        CreatorTemplate.TemplateStatus decision = parseStatus(request.getDecision(), true);
        if (decision != CreatorTemplate.TemplateStatus.APPROVED
                && decision != CreatorTemplate.TemplateStatus.REJECTED) {
            throw new IllegalArgumentException("Reviewer decision must be APPROVED or REJECTED");
        }

        User reviewer = findUserByIdOrThrow(reviewerUserId);

        template.setStatus(decision);
        template.setReviewedBy(reviewer);
        template.setReviewNote(trimToNull(request.getReviewNote()));
        template.setReviewedAt(Instant.now());
        clearAdminReview(template);

        CreatorTemplate saved = creatorTemplateRepository.save(template);
    appendAuditEvent(saved, reviewer, CreatorTemplateAuditEvent.AuditStage.REVIEWER_REVIEW,
        CreatorTemplateAuditEvent.AuditAction.REVIEW_DECISION, decision.name(), request.getReviewNote());
        log.info("Creator template reviewer decision: id={}, decision={}, reviewerUserId={}", id, decision, reviewerUserId);
        return CreatorTemplateDto.fromEntity(saved);
    }

    public CreatorTemplateDto reviewByAdmin(Long id, CreatorTemplateReviewRequest request, Long adminUserId) {
        CreatorTemplate template = creatorTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Creator template not found with id: " + id));

        if (template.getStatus() != CreatorTemplate.TemplateStatus.APPROVED) {
            throw new IllegalStateException("Template must be APPROVED by reviewer before admin decision");
        }

        CreatorTemplate.TemplateStatus decision = parseStatus(request.getDecision(), true);
        if (decision != CreatorTemplate.TemplateStatus.PUBLISHED
                && decision != CreatorTemplate.TemplateStatus.REJECTED) {
            throw new IllegalArgumentException("Admin decision must be PUBLISHED or REJECTED");
        }

        User adminReviewer = findUserByIdOrThrow(adminUserId);

        template.setStatus(decision);
        template.setAdminReviewedBy(adminReviewer);
        template.setAdminReviewNote(trimToNull(request.getReviewNote()));
        template.setAdminReviewedAt(Instant.now());

        if (decision == CreatorTemplate.TemplateStatus.PUBLISHED) {
            template.setLastPublishedAt(Instant.now());
        }

        CreatorTemplate saved = creatorTemplateRepository.save(template);
    appendAuditEvent(saved, adminReviewer, CreatorTemplateAuditEvent.AuditStage.ADMIN_APPROVAL,
        CreatorTemplateAuditEvent.AuditAction.ADMIN_DECISION, decision.name(), request.getReviewNote());
        log.info("Creator template admin decision: id={}, decision={}, adminUserId={}", id, decision, adminUserId);
        return CreatorTemplateDto.fromEntity(saved);
    }

    public CreatorTemplateDto recordMetrics(Long id, CreatorTemplateMetricsRequest request) {
        CreatorTemplate template = creatorTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Creator template not found with id: " + id));

        int attempts = Math.max(1, request.getAttempts() == null ? 1 : request.getAttempts());
        int completions = request.getCompletions() == null ? 0 : Math.max(0, request.getCompletions());
        completions = Math.min(completions, attempts);

        int oldUsage = template.getUsageCount() == null ? 0 : template.getUsageCount();
        int oldCompletions = template.getCompletionCount() == null ? 0 : template.getCompletionCount();
        BigDecimal oldAverage = template.getAverageScore() == null ? BigDecimal.ZERO : template.getAverageScore();

        int newUsage = oldUsage + attempts;
        int newCompletions = oldCompletions + completions;

        if (request.getAverageScore() != null) {
            BigDecimal incomingAverage = BigDecimal.valueOf(request.getAverageScore())
                    .max(BigDecimal.ZERO)
                    .min(BigDecimal.valueOf(100));

            BigDecimal weightedTotal = oldAverage.multiply(BigDecimal.valueOf(oldUsage))
                    .add(incomingAverage.multiply(BigDecimal.valueOf(attempts)));

            BigDecimal weightedAverage = weightedTotal.divide(BigDecimal.valueOf(newUsage), 2, RoundingMode.HALF_UP);
            template.setAverageScore(weightedAverage);
        }

        template.setUsageCount(newUsage);
        template.setCompletionCount(newCompletions);

        CreatorTemplate saved = creatorTemplateRepository.save(template);
        return CreatorTemplateDto.fromEntity(saved);
    }

    public void deleteTemplate(Long id, Long actorUserId, boolean isAdmin) {
        CreatorTemplate template = findEditableTemplate(id, actorUserId, isAdmin);
        creatorTemplateRepository.delete(template);
        log.info("Creator template deleted: id={}, actorUserId={}", id, actorUserId);
    }

    @Transactional(readOnly = true)
    public CreatorTemplateAnalyticsDto getAnalytics() {
        long drafts = creatorTemplateRepository.countByStatus(CreatorTemplate.TemplateStatus.DRAFT);
        long pendingReview = creatorTemplateRepository.countByStatus(CreatorTemplate.TemplateStatus.PENDING_REVIEW);
        long approved = creatorTemplateRepository.countByStatus(CreatorTemplate.TemplateStatus.APPROVED);
        long rejected = creatorTemplateRepository.countByStatus(CreatorTemplate.TemplateStatus.REJECTED);
        long published = creatorTemplateRepository.countByStatus(CreatorTemplate.TemplateStatus.PUBLISHED);

        long miniLessons = creatorTemplateRepository.countByContentType(CreatorTemplate.ContentType.MINI_LESSON);
        long quizzes = creatorTemplateRepository.countByContentType(CreatorTemplate.ContentType.QUIZ);
        long storyBranches = creatorTemplateRepository.countByContentType(CreatorTemplate.ContentType.STORY_BRANCH);

        List<CreatorTemplate> allTemplates = creatorTemplateRepository.findAll();
        long totalUsage = allTemplates.stream().mapToLong(template -> safeInt(template.getUsageCount())).sum();
        long totalCompletions = allTemplates.stream().mapToLong(template -> safeInt(template.getCompletionCount())).sum();

        BigDecimal completionRate = totalUsage == 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(totalCompletions * 100.0 / totalUsage).setScale(2, RoundingMode.HALF_UP);

        BigDecimal averageScore = allTemplates.isEmpty()
                ? BigDecimal.ZERO
                : allTemplates.stream()
                .map(template -> template.getAverageScore() == null ? BigDecimal.ZERO : template.getAverageScore())
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(allTemplates.size()), 2, RoundingMode.HALF_UP);

        List<CreatorTemplateAnalyticsItemDto> topTemplates = creatorTemplateRepository
                .findTop8ByUsageCountGreaterThanOrderByAverageScoreDescUsageCountDesc(0)
                .stream()
                .map(template -> {
                    BigDecimal templateCompletionRate = safeInt(template.getUsageCount()) == 0
                            ? BigDecimal.ZERO
                            : BigDecimal.valueOf(safeInt(template.getCompletionCount()) * 100.0 / safeInt(template.getUsageCount()))
                            .setScale(2, RoundingMode.HALF_UP);

                    return CreatorTemplateAnalyticsItemDto.builder()
                            .id(template.getId())
                            .title(template.getTitle())
                            .contentType(template.getContentType().name())
                            .usageCount(safeInt(template.getUsageCount()))
                            .completionCount(safeInt(template.getCompletionCount()))
                            .completionRate(templateCompletionRate)
                            .averageScore(template.getAverageScore() == null ? BigDecimal.ZERO : template.getAverageScore())
                            .build();
                })
                .toList();

        return CreatorTemplateAnalyticsDto.builder()
                .totalTemplates(allTemplates.size())
                .drafts(drafts)
                .pendingReview(pendingReview)
                .approved(approved)
                .rejected(rejected)
                .published(published)
                .miniLessons(miniLessons)
                .quizzes(quizzes)
                .storyBranches(storyBranches)
                .totalUsage(totalUsage)
                .totalCompletions(totalCompletions)
                .completionRate(completionRate)
                .averageScore(averageScore)
                .topTemplates(topTemplates)
                .build();
    }

    private CreatorTemplate findEditableTemplate(Long id, Long actorUserId, boolean isAdmin) {
        if (isAdmin) {
            return creatorTemplateRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Creator template not found with id: " + id));
        }

        return creatorTemplateRepository.findByIdAndCreatedByUserId(id, actorUserId)
                .orElseThrow(() -> new AccessDeniedException("You cannot edit templates from other creators"));
    }

    private User findUserByIdOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    private CreatorTemplate.TemplateStatus parseStatus(String rawStatus, boolean strict) {
        if (rawStatus == null || rawStatus.isBlank()) {
            return null;
        }

        try {
            return CreatorTemplate.TemplateStatus.valueOf(rawStatus.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            if (!strict) {
                return null;
            }
            throw new IllegalArgumentException("Invalid template status: " + rawStatus);
        }
    }

    private CreatorTemplate.ContentType parseContentType(String rawType, boolean strict) {
        if (rawType == null || rawType.isBlank()) {
            return null;
        }

        try {
            return CreatorTemplate.ContentType.valueOf(rawType.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            if (!strict) {
                return null;
            }
            throw new IllegalArgumentException("Invalid content type: " + rawType);
        }
    }

    private CreatorTemplateAuditEvent.AuditStage parseAuditStage(String rawStage) {
        if (rawStage == null || rawStage.isBlank()) {
            return null;
        }

        try {
            return CreatorTemplateAuditEvent.AuditStage.valueOf(rawStage.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid audit stage: " + rawStage);
        }
    }

    private AuditActorFilter parseAuditActorFilter(String rawActor) {
        if (rawActor == null || rawActor.isBlank()) {
            return new AuditActorFilter(AuditActorType.ANY, null);
        }

        String normalized = rawActor.trim();
        if (SYSTEM_ACTOR_TOKEN.equalsIgnoreCase(normalized) || "actor:system".equalsIgnoreCase(normalized)) {
            return new AuditActorFilter(AuditActorType.SYSTEM, null);
        }

        if (normalized.toLowerCase(Locale.ROOT).startsWith("actor:")) {
            normalized = normalized.substring("actor:".length());
        }

        try {
            long actorUserId = Long.parseLong(normalized);
            if (actorUserId <= 0) {
                throw new IllegalArgumentException("Actor user id must be positive");
            }
            return new AuditActorFilter(AuditActorType.USER, actorUserId);
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("Invalid actor filter: " + rawActor);
        }
    }

    private String normalizeJlptLevel(String rawLevel) {
        if (rawLevel == null || rawLevel.isBlank()) {
            throw new IllegalArgumentException("JLPT level is required");
        }

        String level = rawLevel.trim().toUpperCase(Locale.ROOT);
        if (!VALID_JLPT_LEVELS.contains(level)) {
            throw new IllegalArgumentException("JLPT level must be one of N5, N4, N3, N2, N1");
        }
        return level;
    }

    private int resolveEstimatedMinutes(Integer value) {
        if (value == null) {
            return 10;
        }
        return Math.max(3, Math.min(value, 120));
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private int safeInt(Integer value) {
        return value == null ? 0 : value;
    }

    private void clearAdminReview(CreatorTemplate template) {
        template.setAdminReviewedBy(null);
        template.setAdminReviewNote(null);
        template.setAdminReviewedAt(null);
    }

    private void appendAuditEvent(
            CreatorTemplate template,
            User actor,
            CreatorTemplateAuditEvent.AuditStage stage,
            CreatorTemplateAuditEvent.AuditAction action,
            String decision,
            String note
    ) {
        CreatorTemplateAuditEvent event = CreatorTemplateAuditEvent.builder()
                .template(template)
                .actor(actor)
                .stage(stage)
                .action(action)
                .decision(trimToNull(decision))
                .note(trimToNull(note))
                .build();
        creatorTemplateAuditEventRepository.save(event);
    }

    private enum AuditActorType {
        ANY,
        SYSTEM,
        USER
    }

    private record AuditActorFilter(AuditActorType type, Long actorUserId) {
    }
}
