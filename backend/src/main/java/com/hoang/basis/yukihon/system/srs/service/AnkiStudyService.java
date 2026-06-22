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
import com.hoang.basis.yukihon.system.srs.dto.AnkiReviewRequest;
import com.hoang.basis.yukihon.system.srs.dto.AnkiStudyCardDto;
import com.hoang.basis.yukihon.system.srs.dto.AnkiStudyQueueDto;
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
    private final ObjectMapper objectMapper;

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
        Map<Long, AnkiSrsProgress> progressMap =
                progressList.stream().collect(Collectors.toMap(AnkiSrsProgress::getFlashcardId, p -> p));

        AnkiSrsSetting setting =
                settingRepository.findByUserIdAndDeckId(userId, deckId).orElse(null);
        SchedulingConfig config = resolveConfig(setting);
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
            AnkiSrsProgress progress = progressMap.get(fc.getId());

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

            studyCards.add(buildCardDto(fc, progress, config));
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

        AnkiSrsProgress progress = progressRepository
                .findByUserIdAndDeckIdAndFlashcardId(userId, deck.getId(), flashcard.getId())
                .orElseGet(() -> {
                    AnkiSrsProgress p = new AnkiSrsProgress();
                    p.setUserId(userId);
                    p.setDeckId(deck.getId());
                    p.setFlashcardId(flashcard.getId());
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

        applyAnkiSm2(progress, request.getRating(), config, now);

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

        return buildCardDto(flashcard, progress, config);
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

    private AnkiStudyCardDto buildCardDto(Flashcard fc, AnkiSrsProgress progress, SchedulingConfig config) {
        AnkiStudyCardDto.AnkiStudyCardDtoBuilder b = AnkiStudyCardDto.builder()
                .flashcardId(fc.getId())
                .front(fc.getFront())
                .back(fc.getBack())
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

        b.againPreview(previewLabel(progress, fc, "AGAIN", config));
        b.hardPreview(previewLabel(progress, fc, "HARD", config));
        b.goodPreview(previewLabel(progress, fc, "GOOD", config));
        b.easyPreview(previewLabel(progress, fc, "EASY", config));
        return b.build();
    }

    private String previewLabel(AnkiSrsProgress source, Flashcard fc, String rating, SchedulingConfig config) {
        AnkiSrsProgress copy = copyProgress(source, fc, config);
        LocalDateTime now = LocalDateTime.now();
        applyAnkiSm2(copy, rating, config, now);
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
            copy.setNextReviewAt(source.getNextReviewAt());
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
