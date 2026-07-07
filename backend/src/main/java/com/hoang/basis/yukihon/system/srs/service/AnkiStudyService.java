package com.hoang.basis.yukihon.system.srs.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.system.library.entity.Deck;
import com.hoang.basis.yukihon.system.library.entity.DeckItem;
import com.hoang.basis.yukihon.system.library.entity.Flashcard;
import com.hoang.basis.yukihon.system.library.repository.DeckItemRepository;
import com.hoang.basis.yukihon.system.library.repository.DeckRepository;
import com.hoang.basis.yukihon.system.library.repository.FlashcardRepository;
import com.hoang.basis.yukihon.system.srs.dto.AlgorithmConfigDto;
import com.hoang.basis.yukihon.system.srs.dto.AnkiReviewRequest;
import com.hoang.basis.yukihon.system.srs.dto.AnkiSrsSettingDto;
import com.hoang.basis.yukihon.system.srs.dto.AnkiStatsDto;
import com.hoang.basis.yukihon.system.srs.dto.AnkiStudyCardDto;
import com.hoang.basis.yukihon.system.srs.dto.AnkiStudyQueueDto;
import com.hoang.basis.yukihon.system.srs.dto.RescheduleResultDto;
import com.hoang.basis.yukihon.system.srs.entity.AnkiReviewLog;
import com.hoang.basis.yukihon.system.srs.entity.AnkiSrsProgress;
import com.hoang.basis.yukihon.system.srs.entity.AnkiSrsSetting;
import com.hoang.basis.yukihon.system.srs.entity.SrsAlgorithmConfig;
import com.hoang.basis.yukihon.system.srs.repository.AnkiReviewLogRepository;
import com.hoang.basis.yukihon.system.srs.repository.AnkiSrsProgressRepository;
import com.hoang.basis.yukihon.system.srs.repository.AnkiSrsSettingRepository;
import com.hoang.basis.yukihon.system.srs.repository.SrsAlgorithmConfigRepository;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Anki-style SM-2 scheduler: loads the study queue and applies ratings (AGAIN/HARD/GOOD/EASY),
 * transitioning cards through NEW → LEARNING → REVIEW ↔ RELEARNING and computing intervals.
 * Mirrors the documented Anki backend spec.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AnkiStudyService {

    private static final int LEARN_AHEAD_MINUTES = 20;
    private static final String DEFAULT_CONFIG_CODE = "SM2_DEFAULT";

    private final DeckRepository deckRepository;
    private final DeckItemRepository deckItemRepository;
    private final FlashcardRepository flashcardRepository;
    private final AnkiSrsProgressRepository progressRepository;
    private final AnkiSrsSettingRepository settingRepository;
    private final SrsAlgorithmConfigRepository algorithmConfigRepository;
    private final AnkiReviewLogRepository reviewLogRepository;
    private final FsrsScheduler fsrsScheduler;
    private final ObjectMapper objectMapper;

    /** Resolve the scheduler algorithm for a deck setting ("SM2" default). */
    private String resolveAlgorithmType(AnkiSrsSetting setting) {
        if (setting != null && setting.getAlgorithmConfigId() != null) {
            return algorithmConfigRepository
                    .findById(setting.getAlgorithmConfigId())
                    .map(SrsAlgorithmConfig::getAlgorithmType)
                    .filter(t -> t != null && !t.isBlank())
                    .orElse("SM2");
        }
        return "SM2";
    }

    /** Dispatch one rating to the right scheduler (FSRS vs SM-2). */
    private void applySchedule(
            AnkiSrsProgress progress,
            String rating,
            SchedulingConfig config,
            String algorithmType,
            AnkiSrsSetting setting,
            LocalDateTime now) {
        if ("FSRS".equals(algorithmType)) {
            double retention = setting != null && setting.getTargetRetention() != null
                    ? setting.getTargetRetention()
                    : config.targetRetention;
            int maxInterval = setting != null && setting.getMaximumIntervalDays() != null
                    ? setting.getMaximumIntervalDays()
                    : config.maxIntervalDays;
            fsrsScheduler.apply(progress, rating, retention, maxInterval, now);
        } else {
            applyAnkiSm2(progress, rating, config, now);
        }
    }

    /** The study card sides a flashcard produces, driven by its template. */
    private List<String> sidesFor(Flashcard fc) {
        return "FORWARD_REVERSE".equals(fc.getTemplate()) ? List.of("FORWARD", "REVERSE") : List.of("FORWARD");
    }

    /** Composite key for the per-(flashcard, side) progress map. */
    private String progressKey(Long flashcardId, String side) {
        return flashcardId + "|" + (side != null ? side : "FORWARD");
    }

    /** Clamp a requested side to what the flashcard's template actually supports. */
    private String normalizeSide(String side, Flashcard fc) {
        return "REVERSE".equalsIgnoreCase(side) && "FORWARD_REVERSE".equals(fc.getTemplate()) ? "REVERSE" : "FORWARD";
    }

    // ===================== LOAD QUEUE =====================

    @Transactional(readOnly = true)
    public AnkiStudyQueueDto getStudyQueue(Long userId, Long deckId) {
        Deck deck = deckRepository
                .findById(deckId)
                .orElseThrow(() -> new ResourceNotFoundException("Deck not found: " + deckId));

        List<DeckItem> items = deckItemRepository.findByDeckIdAndIsDeletedFalseOrderByOrderIndexAsc(deck.getId());
        List<Long> flashcardIds = items.stream().map(DeckItem::getFlashcardId).toList();
        Map<Long, Flashcard> fcMap = flashcardRepository.findAllById(flashcardIds).stream()
                .collect(Collectors.toMap(Flashcard::getId, f -> f));

        List<AnkiSrsProgress> progressList = progressRepository.findByUserIdAndDeckId(userId, deckId);
        Map<String, AnkiSrsProgress> progressMap = progressList.stream()
                .collect(Collectors.toMap(p -> progressKey(p.getFlashcardId(), p.getSide()), p -> p, (a, b) -> a));

        AnkiSrsSetting setting =
                settingRepository.findByUserIdAndDeckId(userId, deckId).orElse(null);
        SchedulingConfig config = resolveConfig(setting);
        String algorithmType = resolveAlgorithmType(setting);
        LocalDateTime now = LocalDateTime.now();

        LocalDate today = now.toLocalDate();
        long learnedToday = progressList.stream()
                .filter(p -> p.getFirstLearnedAt() != null)
                .filter(p -> today.equals(p.getFirstLearnedAt().toLocalDate()))
                .count();
        long reviewedToday = progressList.stream()
                .filter(p -> p.getLastReviewedAt() != null)
                .filter(p -> today.equals(p.getLastReviewedAt().toLocalDate()))
                .filter(p -> p.getFirstLearnedAt() == null
                        || !today.equals(p.getFirstLearnedAt().toLocalDate()))
                .count();

        int newLimit = setting != null && setting.getMaxItemsPerDay() != null
                ? Math.max(0, setting.getMaxItemsPerDay() - (int) learnedToday)
                : Integer.MAX_VALUE;
        int dueLimit = setting != null && setting.getMaxReviewsPerDay() != null
                ? Math.max(0, setting.getMaxReviewsPerDay() - (int) reviewedToday)
                : Integer.MAX_VALUE;

        List<AnkiStudyCardDto> studyCards = new ArrayList<>();
        int totalNew = 0;
        int totalLearning = 0;
        int totalReview = 0;
        int dueReviewCards = 0;
        int queuedNew = 0;
        int queuedDue = 0;

        for (DeckItem item : items) {
            Flashcard fc = fcMap.get(item.getFlashcardId());
            if (fc == null) {
                continue;
            }
            for (String side : sidesFor(fc)) {
                AnkiSrsProgress progress = progressMap.get(progressKey(fc.getId(), side));

                if (Boolean.TRUE.equals(progress != null ? progress.getSuspended() : Boolean.FALSE)) {
                    continue;
                }

                boolean isNew = progress == null || "NEW".equals(progress.getState());

                if (isNew) {
                    totalNew++;
                    if (queuedNew >= newLimit) {
                        continue;
                    }
                    queuedNew++;
                } else if ("LEARNING".equals(progress.getState()) || "RELEARNING".equals(progress.getState())) {
                    totalLearning++;
                    boolean dueSoon = progress.getNextReviewAt() == null
                            || !progress.getNextReviewAt().isAfter(now.plusMinutes(LEARN_AHEAD_MINUTES));
                    if (!dueSoon) {
                        continue;
                    }
                } else if ("REVIEW".equals(progress.getState())) {
                    totalReview++;
                    if (!isDue(progress, now)) {
                        continue;
                    }
                    dueReviewCards++;
                    if (queuedDue >= dueLimit) {
                        continue;
                    }
                    queuedDue++;
                } else {
                    if (!isDue(progress, now)) {
                        continue;
                    }
                }

                studyCards.add(buildCardDto(fc, progress, config, algorithmType, setting, side));
            }
        }

        return AnkiStudyQueueDto.builder()
                .cards(studyCards)
                .totalNew(totalNew)
                .totalLearning(totalLearning)
                .totalReview(totalReview)
                .dueReviewCards(dueReviewCards)
                .build();
    }

    // ===================== REVIEW =====================

    public AnkiStudyCardDto review(Long userId, AnkiReviewRequest request) {
        Flashcard flashcard = flashcardRepository
                .findById(request.getFlashcardId())
                .orElseThrow(() -> new ResourceNotFoundException("Flashcard not found: " + request.getFlashcardId()));
        Deck deck = deckRepository
                .findById(request.getDeckId())
                .orElseThrow(() -> new ResourceNotFoundException("Deck not found: " + request.getDeckId()));

        AnkiSrsSetting setting =
                settingRepository.findByUserIdAndDeckId(userId, deck.getId()).orElse(null);
        SchedulingConfig config = resolveConfig(setting);
        LocalDateTime now = LocalDateTime.now();

        String side = normalizeSide(request.getSide(), flashcard);
        AnkiSrsProgress progress = progressRepository
                .findByUserIdAndDeckIdAndFlashcardIdAndSide(userId, deck.getId(), flashcard.getId(), side)
                .orElseGet(() -> {
                    AnkiSrsProgress p = new AnkiSrsProgress();
                    p.setUserId(userId);
                    p.setDeckId(deck.getId());
                    p.setFlashcardId(flashcard.getId());
                    p.setSide(side);
                    p.setState("NEW");
                    p.setEaseFactor(config.startingEase);
                    p.setIntervalDays(0);
                    p.setReviewCount(0);
                    p.setLapses(0);
                    p.setLearningStepIndex(0);
                    p.setMemoryScore(0.0);
                    return p;
                });

        // snapshot for the review log
        String oldState = progress.getState();
        double oldEase = nvl(progress.getEaseFactor(), config.startingEase);
        int oldInterval = nvl(progress.getIntervalDays(), 0);
        int oldLapses = nvl(progress.getLapses(), 0);

        String algorithmType = resolveAlgorithmType(setting);
        applySchedule(progress, request.getRating(), config, algorithmType, setting, now);

        // leech detection (algorithm-agnostic)
        if (setting != null
                && progress.getLapses() != null
                && progress.getLapses() >= nvl(setting.getLeechThreshold(), 8)
                && !Boolean.TRUE.equals(progress.getIsLeech())) {
            progress.setIsLeech(true);
            if (Boolean.TRUE.equals(setting.getSuspendLeeches())) {
                progress.setSuspended(true);
            }
        }

        progress = progressRepository.save(progress);

        AnkiReviewLog reviewLog = new AnkiReviewLog();
        reviewLog.setUserId(userId);
        reviewLog.setProgressId(progress.getId());
        reviewLog.setDeckId(deck.getId());
        reviewLog.setFlashcardId(flashcard.getId());
        reviewLog.setRating(normalizeRating(request.getRating()));
        reviewLog.setScore(request.getScore());
        reviewLog.setTimeTakenMs(request.getTimeTakenMs());
        reviewLog.setReviewedAt(now);
        reviewLog.setOldState(oldState);
        reviewLog.setNewState(progress.getState());
        reviewLog.setOldEaseFactor(oldEase);
        reviewLog.setNewEaseFactor(progress.getEaseFactor());
        reviewLog.setOldIntervalDays(oldInterval);
        reviewLog.setNewIntervalDays(progress.getIntervalDays());
        reviewLog.setOldLapses(oldLapses);
        reviewLog.setNewLapses(progress.getLapses());
        reviewLog.setSourceType(request.getSourceType() != null ? request.getSourceType() : "ANKI_REVIEW");
        reviewLogRepository.save(reviewLog);

        return buildCardDto(flashcard, progress, config, algorithmType, setting, side);
    }

    // ===================== SM-2 CORE =====================

    private void applyAnkiSm2(AnkiSrsProgress progress, String rating, SchedulingConfig config, LocalDateTime now) {
        String normalizedRating = normalizeRating(rating);
        String state = progress.getState() != null ? progress.getState() : "NEW";

        if (progress.getFirstLearnedAt() == null) {
            progress.setFirstLearnedAt(now);
        }
        progress.setReviewCount(nvl(progress.getReviewCount(), 0) + 1);

        if ("REVIEW".equals(state)) {
            applyReviewAnswer(progress, normalizedRating, config, now);
        } else if ("RELEARNING".equals(state)) {
            applyLearningAnswer(progress, normalizedRating, config, now, true);
        } else {
            applyLearningAnswer(progress, normalizedRating, config, now, false);
        }

        progress.setLastRating(normalizedRating);
        progress.setLastReviewedAt(now);
        progress.setMemoryScore(memoryScore(progress.getEaseFactor(), config));
    }

    private void applyLearningAnswer(
            AnkiSrsProgress progress, String rating, SchedulingConfig config, LocalDateTime now, boolean relearning) {
        List<Duration> steps = relearning ? config.relearningSteps : config.learningSteps;

        if (steps.isEmpty()) {
            graduate(progress, relearning ? progress.getIntervalDays() : config.graduatingIntervalDays, config, now);
            return;
        }

        int currentStep = clamp(nvl(progress.getLearningStepIndex(), 0), 0, steps.size() - 1);

        switch (rating) {
            case "AGAIN" -> {
                progress.setState(relearning ? "RELEARNING" : "LEARNING");
                progress.setLearningStepIndex(0);
                progress.setNextReviewAt(now.plus(steps.get(0)));
            }
            case "HARD" -> {
                Duration againDelay = steps.get(currentStep);
                Duration goodDelay = currentStep + 1 < steps.size()
                        ? steps.get(currentStep + 1)
                        : Duration.ofDays(Math.max(
                                1, relearning ? nvl(progress.getIntervalDays(), 1) : config.graduatingIntervalDays));
                Duration hardDelay = average(againDelay, goodDelay);
                progress.setState(relearning ? "RELEARNING" : "LEARNING");
                progress.setLearningStepIndex(currentStep);
                progress.setNextReviewAt(now.plus(hardDelay));
            }
            case "EASY" -> graduate(
                    progress,
                    relearning
                            ? Math.max(nvl(progress.getIntervalDays(), 1), config.graduatingIntervalDays)
                            : config.easyIntervalDays,
                    config,
                    now);
            default -> {
                if (currentStep + 1 >= steps.size()) {
                    graduate(
                            progress,
                            relearning ? progress.getIntervalDays() : config.graduatingIntervalDays,
                            config,
                            now);
                } else {
                    int nextStep = currentStep + 1;
                    progress.setState(relearning ? "RELEARNING" : "LEARNING");
                    progress.setLearningStepIndex(nextStep);
                    progress.setNextReviewAt(now.plus(steps.get(nextStep)));
                }
            }
        }
    }

    private void applyReviewAnswer(
            AnkiSrsProgress progress, String rating, SchedulingConfig config, LocalDateTime now) {
        int currentInterval = Math.max(1, nvl(progress.getIntervalDays(), 1));
        int daysLate =
                progress.getNextReviewAt() != null && progress.getNextReviewAt().isBefore(now)
                        ? (int) Math.max(0, ChronoUnit.DAYS.between(progress.getNextReviewAt(), now))
                        : 0;
        double ease = Math.max(config.minEase, nvl(progress.getEaseFactor(), config.startingEase));
        double intervalModifier = config.intervalModifier * retentionModifier(config.targetRetention);

        switch (rating) {
            case "AGAIN" -> {
                progress.setEaseFactor(Math.max(config.minEase, ease - 0.20));
                progress.setLapses(nvl(progress.getLapses(), 0) + 1);
                progress.setLearningStepIndex(0);

                int relearnInterval = config.newInterval <= 0
                        ? 1
                        : clampInterval(
                                (int) Math.round(currentInterval * config.newInterval), 1, config.maxIntervalDays);
                progress.setIntervalDays(relearnInterval);

                if (config.relearningSteps.isEmpty()) {
                    progress.setState("REVIEW");
                    progress.setNextReviewAt(now.plusDays(relearnInterval));
                } else {
                    progress.setState("RELEARNING");
                    progress.setNextReviewAt(now.plus(config.relearningSteps.get(0)));
                }
            }
            case "HARD" -> {
                progress.setEaseFactor(Math.max(config.minEase, ease - 0.15));
                int nextInterval = nextReviewInterval(
                        currentInterval, daysLate, 0.25, config.hardInterval, intervalModifier, config);
                scheduleReview(progress, nextInterval, now);
            }
            case "EASY" -> {
                progress.setEaseFactor(ease + 0.15);
                int nextInterval = nextReviewInterval(
                        currentInterval, daysLate, 1.0, ease * config.easyBonus, intervalModifier, config);
                scheduleReview(progress, nextInterval, now);
            }
            default -> {
                progress.setEaseFactor(ease);
                int nextInterval = nextReviewInterval(currentInterval, daysLate, 0.5, ease, intervalModifier, config);
                scheduleReview(progress, nextInterval, now);
            }
        }
    }

    private int nextReviewInterval(
            int currentInterval,
            int daysLate,
            double lateMultiplier,
            double answerMultiplier,
            double intervalModifier,
            SchedulingConfig config) {
        double base = currentInterval + (daysLate * lateMultiplier);
        int computed = (int) Math.round(base * answerMultiplier * intervalModifier);
        return clampInterval(computed, currentInterval + 1, config.maxIntervalDays);
    }

    private void graduate(AnkiSrsProgress progress, Integer intervalDays, SchedulingConfig config, LocalDateTime now) {
        int interval = clampInterval(nvl(intervalDays, config.graduatingIntervalDays), 1, config.maxIntervalDays);
        progress.setState("REVIEW");
        progress.setLearningStepIndex(0);
        progress.setEaseFactor(Math.max(config.minEase, nvl(progress.getEaseFactor(), config.startingEase)));
        progress.setIntervalDays(interval);
        progress.setNextReviewAt(now.plusDays(interval));
    }

    private void scheduleReview(AnkiSrsProgress progress, int intervalDays, LocalDateTime now) {
        progress.setState("REVIEW");
        progress.setLearningStepIndex(0);
        progress.setIntervalDays(intervalDays);
        progress.setNextReviewAt(now.plusDays(intervalDays));
    }

    private boolean isDue(AnkiSrsProgress p, LocalDateTime now) {
        if ("LEARNING".equals(p.getState()) || "RELEARNING".equals(p.getState())) {
            return p.getNextReviewAt() == null || !p.getNextReviewAt().isAfter(now);
        }
        return p.getNextReviewAt() != null && !p.getNextReviewAt().isAfter(now);
    }

    // ===================== PREVIEW =====================

    private AnkiStudyCardDto buildCardDto(
            Flashcard fc,
            AnkiSrsProgress progress,
            SchedulingConfig config,
            String algorithmType,
            AnkiSrsSetting setting,
            String side) {
        boolean reverse = "REVERSE".equals(side);
        AnkiStudyCardDto.AnkiStudyCardDtoBuilder b = AnkiStudyCardDto.builder()
                .flashcardId(fc.getId())
                .side(reverse ? "REVERSE" : "FORWARD")
                // On the reverse card the prompt is the back and the answer is the front.
                .front(reverse ? fc.getBack() : fc.getFront())
                .back(reverse ? fc.getFront() : fc.getBack())
                .hint(fc.getHint())
                .explanation(fc.getExplanation())
                .imageUrl(fc.getImageUrl())
                .audioUrl(fc.getAudioUrl());

        if (progress != null) {
            b.progressId(progress.getId())
                    .state(progress.getState())
                    .easeFactor(progress.getEaseFactor())
                    .intervalDays(progress.getIntervalDays())
                    .reviewCount(progress.getReviewCount())
                    .lapses(progress.getLapses())
                    .memoryScore(progress.getMemoryScore())
                    .nextReviewAt(progress.getNextReviewAt());
        } else {
            b.state("NEW")
                    .easeFactor(config.startingEase)
                    .intervalDays(0)
                    .reviewCount(0)
                    .lapses(0)
                    .memoryScore(0.0);
        }

        b.againPreview(previewLabel(progress, fc, "AGAIN", config, algorithmType, setting));
        b.hardPreview(previewLabel(progress, fc, "HARD", config, algorithmType, setting));
        b.goodPreview(previewLabel(progress, fc, "GOOD", config, algorithmType, setting));
        b.easyPreview(previewLabel(progress, fc, "EASY", config, algorithmType, setting));
        return b.build();
    }

    private String previewLabel(
            AnkiSrsProgress source,
            Flashcard fc,
            String rating,
            SchedulingConfig config,
            String algorithmType,
            AnkiSrsSetting setting) {
        AnkiSrsProgress copy = copyProgress(source, fc, config);
        LocalDateTime now = LocalDateTime.now();
        applySchedule(copy, rating, config, algorithmType, setting, now);
        LocalDateTime next = copy.getNextReviewAt();
        if (next == null) {
            return "-";
        }
        long minutes = Math.max(0, ChronoUnit.MINUTES.between(now, next));
        if (minutes < 1) return "< 1m";
        if (minutes < 60) return minutes + "m";
        long hours = Math.max(1, ChronoUnit.HOURS.between(now, next));
        if (hours < 24) return hours + "h";
        long days = Math.max(1, ChronoUnit.DAYS.between(now.toLocalDate(), next.toLocalDate()));
        if (days < 30) return days + "d";
        long months = Math.max(1, Math.round(days / 30.0));
        if (months < 24) return months + "mo";
        return Math.round(days / 365.0) + "y";
    }

    private AnkiSrsProgress copyProgress(AnkiSrsProgress source, Flashcard fc, SchedulingConfig config) {
        AnkiSrsProgress copy = new AnkiSrsProgress();
        copy.setFlashcardId(fc.getId());
        if (source != null) {
            copy.setState(source.getState());
            copy.setEaseFactor(source.getEaseFactor());
            copy.setIntervalDays(source.getIntervalDays());
            copy.setReviewCount(source.getReviewCount());
            copy.setLearningStepIndex(source.getLearningStepIndex());
            copy.setLapses(source.getLapses());
            copy.setFirstLearnedAt(source.getFirstLearnedAt());
            copy.setLastReviewedAt(source.getLastReviewedAt());
            copy.setNextReviewAt(source.getNextReviewAt());
            copy.setStability(source.getStability());
            copy.setDifficulty(source.getDifficulty());
            copy.setAlgorithmType(source.getAlgorithmType());
        } else {
            copy.setState("NEW");
            copy.setEaseFactor(config.startingEase);
            copy.setIntervalDays(0);
            copy.setReviewCount(0);
            copy.setLearningStepIndex(0);
            copy.setLapses(0);
        }
        return copy;
    }

    // ===================== HELPERS =====================

    private double retentionModifier(double targetRetention) {
        double retention = Math.max(0.70, Math.min(0.98, targetRetention));
        double modifier = Math.pow(0.90 / retention, 2);
        return Math.max(0.50, Math.min(1.50, modifier));
    }

    // ===================== STATS =====================

    @Transactional(readOnly = true)
    public AnkiStatsDto getStats(Long userId, Long deckId) {
        deckRepository.findById(deckId).orElseThrow(() -> new ResourceNotFoundException("Deck not found: " + deckId));

        // Count generated study cards (a FORWARD_REVERSE note yields two), not just notes.
        List<Long> deckFlashcardIds =
                deckItemRepository.findByDeckIdAndIsDeletedFalseOrderByOrderIndexAsc(deckId).stream()
                        .map(DeckItem::getFlashcardId)
                        .toList();
        long totalCards = flashcardRepository.findAllById(deckFlashcardIds).stream()
                .mapToLong(fc -> sidesFor(fc).size())
                .sum();
        List<AnkiSrsProgress> all = progressRepository.findByUserIdAndDeckId(userId, deckId);
        List<AnkiSrsProgress> active =
                all.stream().filter(p -> !Boolean.TRUE.equals(p.getSuspended())).toList();

        LocalDate today = LocalDate.now();

        long learning =
                active.stream().filter(p -> "LEARNING".equals(p.getState())).count();
        long relearning =
                active.stream().filter(p -> "RELEARNING".equals(p.getState())).count();
        long review = active.stream().filter(p -> "REVIEW".equals(p.getState())).count();
        long started = all.stream().filter(p -> !"NEW".equals(p.getState())).count();
        long newCards = Math.max(0, totalCards - started);
        long suspended =
                all.stream().filter(p -> Boolean.TRUE.equals(p.getSuspended())).count();
        long leech =
                all.stream().filter(p -> Boolean.TRUE.equals(p.getIsLeech())).count();

        long studiedToday = all.stream()
                .filter(p -> p.getLastReviewedAt() != null
                        && today.equals(p.getLastReviewedAt().toLocalDate()))
                .count();
        long dueToday = active.stream()
                .filter(p -> p.getNextReviewAt() != null
                        && !p.getNextReviewAt().toLocalDate().isAfter(today))
                .count();
        long dueTomorrow = active.stream()
                .filter(p -> p.getNextReviewAt() != null
                        && p.getNextReviewAt().toLocalDate().equals(today.plusDays(1)))
                .count();

        long totalReviews =
                all.stream().mapToLong(p -> nvl(p.getReviewCount(), 0)).sum();
        long totalLapses = all.stream().mapToLong(p -> nvl(p.getLapses(), 0)).sum();

        List<AnkiSrsProgress> reviewCards =
                active.stream().filter(p -> "REVIEW".equals(p.getState())).toList();
        double avgEase = reviewCards.stream()
                .mapToDouble(p -> nvl(p.getEaseFactor(), 2.5))
                .average()
                .orElse(0);
        double avgInterval = reviewCards.stream()
                .mapToDouble(p -> nvl(p.getIntervalDays(), 0))
                .average()
                .orElse(0);
        double avgMemory = active.stream()
                .mapToDouble(p -> nvl(p.getMemoryScore(), 0.0))
                .average()
                .orElse(0);

        List<AnkiStatsDto.Bucket> future = new ArrayList<>();
        for (int d = 0; d < 14; d++) {
            LocalDate day = today.plusDays(d);
            long c = reviewCards.stream()
                    .filter(p -> p.getNextReviewAt() != null
                            && p.getNextReviewAt().toLocalDate().equals(day))
                    .count();
            future.add(AnkiStatsDto.Bucket.builder()
                    .label(d == 0 ? "Hôm nay" : (d == 1 ? "Mai" : "+" + d))
                    .count(c)
                    .build());
        }

        List<AnkiStatsDto.Bucket> intervals = List.of(
                bucket("1 ngày", reviewCards, p -> nvl(p.getIntervalDays(), 0) <= 1),
                bucket("2–3 ngày", reviewCards, p -> within(nvl(p.getIntervalDays(), 0), 2, 3)),
                bucket("4–7 ngày", reviewCards, p -> within(nvl(p.getIntervalDays(), 0), 4, 7)),
                bucket("1–4 tuần", reviewCards, p -> within(nvl(p.getIntervalDays(), 0), 8, 30)),
                bucket("1–3 tháng", reviewCards, p -> within(nvl(p.getIntervalDays(), 0), 31, 90)),
                bucket("3 tháng+", reviewCards, p -> nvl(p.getIntervalDays(), 0) > 90));

        List<AnkiStatsDto.Bucket> eases = List.of(
                bucket("< 2.0", reviewCards, p -> nvl(p.getEaseFactor(), 2.5) < 2.0),
                bucket("2.0–2.5", reviewCards, p -> withinD(nvl(p.getEaseFactor(), 2.5), 2.0, 2.5)),
                bucket("2.5–3.0", reviewCards, p -> withinD(nvl(p.getEaseFactor(), 2.5), 2.5, 3.0)),
                bucket("3.0+", reviewCards, p -> nvl(p.getEaseFactor(), 2.5) >= 3.0));

        return AnkiStatsDto.builder()
                .totalCards(totalCards)
                .newCards(newCards)
                .learningCards(learning)
                .relearningCards(relearning)
                .reviewCards(review)
                .suspendedCards(suspended)
                .leechCards(leech)
                .studiedToday(studiedToday)
                .dueToday(dueToday)
                .dueTomorrow(dueTomorrow)
                .avgMemoryScore(round1(avgMemory))
                .avgEaseFactor(round2(avgEase))
                .avgIntervalDays(round1(avgInterval))
                .totalReviews(totalReviews)
                .totalLapses(totalLapses)
                .futureReviews(future)
                .intervalBuckets(intervals)
                .easeBuckets(eases)
                .build();
    }

    private boolean within(int v, int min, int max) {
        return v >= min && v <= max;
    }

    private boolean withinD(double v, double min, double max) {
        return v >= min && v < max;
    }

    private AnkiStatsDto.Bucket bucket(
            String label, List<AnkiSrsProgress> cards, java.util.function.Predicate<AnkiSrsProgress> pred) {
        return AnkiStatsDto.Bucket.builder()
                .label(label)
                .count(cards.stream().filter(pred).count())
                .build();
    }

    private double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }

    private double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    // ===================== SETTINGS =====================

    @Transactional(readOnly = true)
    public AnkiSrsSettingDto getSettings(Long userId, Long deckId) {
        return settingRepository
                .findByUserIdAndDeckId(userId, deckId)
                .map(this::toSettingDto)
                .orElseGet(() -> AnkiSrsSettingDto.builder()
                        .targetRetention(0.9)
                        .maxReviewsPerDay(200)
                        .maxItemsPerDay(20)
                        .maximumIntervalDays(36500)
                        .suspendLeeches(true)
                        .leechThreshold(8)
                        .algorithmType("SM2")
                        .build());
    }

    public AnkiSrsSettingDto updateSettings(Long userId, Long deckId, AnkiSrsSettingDto dto) {
        AnkiSrsSetting s = settingRepository
                .findByUserIdAndDeckId(userId, deckId)
                .orElseGet(() -> {
                    AnkiSrsSetting ns = new AnkiSrsSetting();
                    ns.setUserId(userId);
                    ns.setDeckId(deckId);
                    return ns;
                });
        if (dto.getAlgorithmConfigId() != null) {
            s.setAlgorithmConfigId(dto.getAlgorithmConfigId());
        }
        if (dto.getTargetRetention() != null) {
            s.setTargetRetention(Math.max(0.70, Math.min(0.98, dto.getTargetRetention())));
        }
        if (dto.getMaxReviewsPerDay() != null) {
            s.setMaxReviewsPerDay(Math.max(0, dto.getMaxReviewsPerDay()));
        }
        if (dto.getMaxItemsPerDay() != null) {
            s.setMaxItemsPerDay(Math.max(0, dto.getMaxItemsPerDay()));
        }
        if (dto.getMaximumIntervalDays() != null) {
            s.setMaximumIntervalDays(clamp(dto.getMaximumIntervalDays(), 1, 36500));
        }
        if (dto.getSuspendLeeches() != null) {
            s.setSuspendLeeches(dto.getSuspendLeeches());
        }
        if (dto.getLeechThreshold() != null) {
            s.setLeechThreshold(Math.max(1, dto.getLeechThreshold()));
        }
        return toSettingDto(settingRepository.save(s));
    }

    // ===================== ALGORITHMS =====================

    /** List the enabled SRS algorithm presets a deck can be switched to. */
    @Transactional(readOnly = true)
    public List<AlgorithmConfigDto> listAlgorithms() {
        return algorithmConfigRepository.findAll().stream()
                .filter(c -> Boolean.TRUE.equals(c.getEnabled()))
                .map(c -> new AlgorithmConfigDto(c.getId(), c.getCode(), c.getName(), c.getAlgorithmType()))
                .toList();
    }

    /**
     * Switch a deck to SM-2 or FSRS and reschedule existing cards. When moving to FSRS, seed each
     * card's stability/difficulty from its current interval and ease so review history is preserved.
     */
    public AnkiSrsSettingDto switchAlgorithm(Long userId, Long deckId, String algorithmType) {
        boolean toFsrs = "FSRS".equalsIgnoreCase(algorithmType);
        String code = toFsrs ? "FSRS_DEFAULT" : DEFAULT_CONFIG_CODE;
        SrsAlgorithmConfig cfg = algorithmConfigRepository
                .findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Algorithm config not found: " + code));

        AnkiSrsSetting s = settingRepository
                .findByUserIdAndDeckId(userId, deckId)
                .orElseGet(() -> {
                    AnkiSrsSetting ns = new AnkiSrsSetting();
                    ns.setUserId(userId);
                    ns.setDeckId(deckId);
                    return ns;
                });
        s.setAlgorithmConfigId(cfg.getId());
        settingRepository.save(s);

        List<AnkiSrsProgress> progressList = progressRepository.findByUserIdAndDeckId(userId, deckId);
        for (AnkiSrsProgress p : progressList) {
            if (toFsrs) {
                if (p.getStability() == null || p.getDifficulty() == null) {
                    int interval = p.getIntervalDays() != null && p.getIntervalDays() > 0 ? p.getIntervalDays() : 1;
                    double stability = Math.max(0.1, interval);
                    // Map ease (1.3 hardest … 3.5 easiest) onto difficulty (10 hardest … 1 easiest).
                    double ease = p.getEaseFactor() != null ? p.getEaseFactor() : 2.5;
                    double difficulty = Math.max(1.0, Math.min(10.0, 11.0 - (ease - 1.3) / (3.5 - 1.3) * 9.0));
                    p.setStability(stability);
                    p.setDifficulty(difficulty);
                    p.setMemoryScore(Math.round(1000.0 * (stability / (stability + 15.0))) / 10.0);
                }
                p.setAlgorithmType("FSRS");
            } else {
                p.setAlgorithmType("SM2");
            }
        }
        progressRepository.saveAll(progressList);
        return toSettingDto(s);
    }

    // ===================== RESCHEDULE (history replay) =====================

    /**
     * Rebuild every card's scheduling state by replaying its full review-log history through the
     * deck's currently-configured scheduler (SM-2 or FSRS), preserving the real time gaps between
     * reviews. Far more accurate than the estimated seed done by {@link #switchAlgorithm}. When
     * {@code dryRun} is true nothing is persisted — the result only previews the diffs.
     */
    public RescheduleResultDto reschedule(Long userId, Long deckId, boolean dryRun) {
        deckRepository.findById(deckId).orElseThrow(() -> new ResourceNotFoundException("Deck not found: " + deckId));

        AnkiSrsSetting setting =
                settingRepository.findByUserIdAndDeckId(userId, deckId).orElse(null);
        SchedulingConfig config = resolveConfig(setting);
        String algorithmType = resolveAlgorithmType(setting);

        List<AnkiSrsProgress> progressList = progressRepository.findByUserIdAndDeckId(userId, deckId);
        Map<Long, List<AnkiReviewLog>> logsByProgress =
                reviewLogRepository.findByUserIdAndDeckIdOrderByReviewedAtAsc(userId, deckId).stream()
                        .collect(Collectors.groupingBy(AnkiReviewLog::getProgressId));

        int changed = 0;
        int skippedNoHistory = 0;
        List<RescheduleResultDto.Change> changes = new ArrayList<>();
        List<AnkiSrsProgress> toSave = new ArrayList<>();

        for (AnkiSrsProgress p : progressList) {
            List<AnkiReviewLog> logs = logsByProgress.get(p.getId());
            if (logs == null || logs.isEmpty()) {
                skippedNoHistory++;
                continue;
            }

            String oldState = p.getState();
            Integer oldInterval = p.getIntervalDays();
            LocalDateTime oldNext = p.getNextReviewAt();

            // In dryRun, replay on a detached copy so JPA dirty-checking never flushes changes.
            AnkiSrsProgress work = dryRun ? cloneIdentity(p) : p;
            resetForReplay(work, config);
            for (AnkiReviewLog log : logs) {
                applySchedule(work, log.getRating(), config, algorithmType, setting, log.getReviewedAt());
            }
            work.setAlgorithmType(algorithmType);

            boolean diff = !java.util.Objects.equals(oldState, work.getState())
                    || !java.util.Objects.equals(oldInterval, work.getIntervalDays())
                    || !java.util.Objects.equals(oldNext, work.getNextReviewAt());
            if (diff) {
                changed++;
                if (changes.size() < 100) {
                    changes.add(RescheduleResultDto.Change.builder()
                            .flashcardId(p.getFlashcardId())
                            .side(p.getSide())
                            .oldState(oldState)
                            .newState(work.getState())
                            .oldIntervalDays(oldInterval)
                            .newIntervalDays(work.getIntervalDays())
                            .oldNextReviewAt(oldNext)
                            .newNextReviewAt(work.getNextReviewAt())
                            .build());
                }
            }
            if (!dryRun) {
                toSave.add(work);
            }
        }

        if (!dryRun && !toSave.isEmpty()) {
            progressRepository.saveAll(toSave);
        }

        return RescheduleResultDto.builder()
                .algorithmType(algorithmType)
                .dryRun(dryRun)
                .cardsProcessed(progressList.size())
                .cardsChanged(changed)
                .cardsSkippedNoHistory(skippedNoHistory)
                .changes(changes)
                .build();
    }

    /** Fresh detached copy carrying only the identity fields; scheduling fields get reset before replay. */
    private AnkiSrsProgress cloneIdentity(AnkiSrsProgress s) {
        AnkiSrsProgress c = new AnkiSrsProgress();
        c.setId(s.getId());
        c.setUserId(s.getUserId());
        c.setDeckId(s.getDeckId());
        c.setFlashcardId(s.getFlashcardId());
        c.setSide(s.getSide());
        return c;
    }

    /** Clear all scheduling state back to a pristine NEW card, ready to replay logs from scratch. */
    private void resetForReplay(AnkiSrsProgress p, SchedulingConfig config) {
        p.setState("NEW");
        p.setEaseFactor(config.startingEase);
        p.setIntervalDays(0);
        p.setReviewCount(0);
        p.setLearningStepIndex(0);
        p.setLapses(0);
        p.setMemoryScore(0.0);
        p.setStability(null);
        p.setDifficulty(null);
        p.setRetrievability(null);
        p.setLastRating(null);
        p.setFirstLearnedAt(null);
        p.setLastReviewedAt(null);
        p.setNextReviewAt(null);
    }

    private AnkiSrsSettingDto toSettingDto(AnkiSrsSetting s) {
        String algoType = "SM2";
        if (s.getAlgorithmConfigId() != null) {
            algoType = algorithmConfigRepository
                    .findById(s.getAlgorithmConfigId())
                    .map(SrsAlgorithmConfig::getAlgorithmType)
                    .orElse("SM2");
        }
        return AnkiSrsSettingDto.builder()
                .algorithmConfigId(s.getAlgorithmConfigId())
                .algorithmType(algoType)
                .targetRetention(s.getTargetRetention())
                .maxReviewsPerDay(s.getMaxReviewsPerDay())
                .maxItemsPerDay(s.getMaxItemsPerDay())
                .maximumIntervalDays(s.getMaximumIntervalDays())
                .suspendLeeches(s.getSuspendLeeches())
                .leechThreshold(s.getLeechThreshold())
                .build();
    }

    // ===================== SUSPEND =====================

    public void setCardSuspended(Long userId, Long deckId, Long flashcardId, boolean suspended) {
        List<AnkiSrsProgress> rows =
                progressRepository.findByUserIdAndDeckIdAndFlashcardId(userId, deckId, flashcardId);
        if (rows.isEmpty()) {
            throw new ResourceNotFoundException("Progress not found");
        }
        rows.forEach(p -> p.setSuspended(suspended));
        progressRepository.saveAll(rows);
    }

    private double memoryScore(Double easeFactor, SchedulingConfig config) {
        double ease = nvl(easeFactor, config.startingEase);
        return Math.min(100.0, Math.max(0.0, (ease - config.minEase) / (3.5 - config.minEase) * 100.0));
    }

    private int clampInterval(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }

    private int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }

    private Duration average(Duration a, Duration b) {
        return Duration.ofSeconds((a.getSeconds() + b.getSeconds()) / 2);
    }

    private String normalizeRating(String rating) {
        if (rating == null) {
            return "GOOD";
        }
        String upper = rating.trim().toUpperCase();
        return switch (upper) {
            case "AGAIN", "HARD", "GOOD", "EASY" -> upper;
            default -> "GOOD";
        };
    }

    private int nvl(Integer value, int fallback) {
        return value != null ? value : fallback;
    }

    private double nvl(Double value, double fallback) {
        return value != null ? value : fallback;
    }

    private SchedulingConfig resolveConfig(AnkiSrsSetting setting) {
        String configJson = null;
        if (setting != null && setting.getAlgorithmConfigId() != null) {
            configJson = algorithmConfigRepository
                    .findById(setting.getAlgorithmConfigId())
                    .map(SrsAlgorithmConfig::getConfigJson)
                    .orElse(null);
        }
        if (configJson == null) {
            configJson = algorithmConfigRepository
                    .findByCode(DEFAULT_CONFIG_CODE)
                    .map(SrsAlgorithmConfig::getConfigJson)
                    .orElse(null);
        }
        return SchedulingConfig.from(setting, configJson, objectMapper);
    }

    // ===================== CONFIG =====================

    static class SchedulingConfig {
        List<Duration> learningSteps = List.of(Duration.ofMinutes(1), Duration.ofMinutes(10));
        List<Duration> relearningSteps = List.of(Duration.ofMinutes(10));
        int graduatingIntervalDays = 1;
        int easyIntervalDays = 4;
        int maxIntervalDays = 36500;
        double startingEase = 2.5;
        double minEase = 1.3;
        double easyBonus = 1.3;
        double hardInterval = 1.2;
        double intervalModifier = 1.0;
        double newInterval = 0.0;
        double targetRetention = 0.9;

        static SchedulingConfig from(AnkiSrsSetting setting, String configJson, ObjectMapper objectMapper) {
            SchedulingConfig config = new SchedulingConfig();
            if (setting != null && setting.getTargetRetention() != null) {
                config.targetRetention = setting.getTargetRetention();
            }
            if (setting != null && setting.getMaximumIntervalDays() != null) {
                config.maxIntervalDays = setting.getMaximumIntervalDays();
            }
            if (configJson == null || configJson.isBlank()) {
                return config;
            }
            try {
                JsonNode root = objectMapper.readTree(configJson);
                config.learningSteps = readSteps(root, "learningSteps", config.learningSteps);
                config.relearningSteps = readSteps(root, "relearningSteps", config.relearningSteps);
                config.graduatingIntervalDays = readInt(root, "graduatingIntervalDays", config.graduatingIntervalDays);
                config.easyIntervalDays = readInt(root, "easyIntervalDays", config.easyIntervalDays);
                config.maxIntervalDays = readInt(root, "maxIntervalDays", config.maxIntervalDays);
                config.startingEase = readDouble(root, "startingEase", config.startingEase, 1.3, 5.0);
                config.minEase = readDouble(root, "minEase", config.minEase, 1.3, 5.0);
                config.easyBonus = readDouble(root, "easyBonus", config.easyBonus, 1.0, 5.0);
                config.hardInterval = readDouble(root, "hardInterval", config.hardInterval, 1.0, 5.0);
                config.intervalModifier = readDouble(root, "intervalModifier", config.intervalModifier, 0.5, 2.0);
                config.newInterval = readDouble(root, "newInterval", config.newInterval, 0.0, 1.0);
            } catch (Exception ignored) {
                return config;
            }
            config.easyIntervalDays = Math.max(config.graduatingIntervalDays + 1, config.easyIntervalDays);
            config.maxIntervalDays = Math.max(config.easyIntervalDays, config.maxIntervalDays);
            return config;
        }

        private static List<Duration> readSteps(JsonNode root, String key, List<Duration> fallback) {
            JsonNode node = root.get(key);
            if (node == null || !node.isArray() || node.isEmpty()) {
                return fallback;
            }
            List<Duration> steps = new ArrayList<>();
            for (JsonNode element : node) {
                long minutes = element.asLong(0);
                if (minutes > 0) {
                    steps.add(Duration.ofMinutes(minutes));
                }
            }
            return steps.isEmpty() ? fallback : steps;
        }

        private static int readInt(JsonNode root, String key, int fallback) {
            JsonNode node = root.get(key);
            return node != null && node.isNumber() ? node.asInt(fallback) : fallback;
        }

        private static double readDouble(JsonNode root, String key, double fallback, double min, double max) {
            JsonNode node = root.get(key);
            if (node == null || !node.isNumber()) {
                return fallback;
            }
            return Math.max(min, Math.min(max, node.asDouble(fallback)));
        }
    }
}
