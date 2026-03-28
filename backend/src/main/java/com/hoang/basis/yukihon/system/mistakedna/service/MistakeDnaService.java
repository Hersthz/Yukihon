package com.hoang.basis.yukihon.system.mistakedna.service;

import com.hoang.basis.yukihon.system.lesson.entity.Lesson;
import com.hoang.basis.yukihon.system.lesson.repository.LessonRepository;
import com.hoang.basis.yukihon.system.mistakedna.dto.MistakeDnaDto;
import com.hoang.basis.yukihon.system.mistakedna.dto.MistakePatternDto;
import com.hoang.basis.yukihon.system.quiz.entity.Quiz;
import com.hoang.basis.yukihon.system.quiz.repository.QuizRepository;
import com.hoang.basis.yukihon.system.savedword.entity.SavedWord;
import com.hoang.basis.yukihon.system.savedword.repository.SavedWordRepository;
import com.hoang.basis.yukihon.system.userlearningstats.entity.UserLearningStats;
import com.hoang.basis.yukihon.system.userlearningstats.repository.UserLearningStatsRepository;
import com.hoang.basis.yukihon.system.userprogress.entity.UserProgress;
import com.hoang.basis.yukihon.system.userprogress.repository.UserProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MistakeDnaService {

    private static final Pattern HAN_PATTERN = Pattern.compile("\\p{IsHan}");

    private final UserProgressRepository userProgressRepository;
    private final QuizRepository quizRepository;
    private final LessonRepository lessonRepository;
    private final SavedWordRepository savedWordRepository;
    private final UserLearningStatsRepository userLearningStatsRepository;

    public MistakeDnaDto getMistakeDna(Long userId) {
        List<UserProgress> progressEntries = userProgressRepository.findByUserId(userId);
        List<UserProgress> quizProgressEntries = progressEntries.stream()
                .filter(progress -> progress.getQuizId() != null)
                .collect(Collectors.toList());
        List<UserProgress> lessonProgressEntries = progressEntries.stream()
                .filter(progress -> progress.getLessonId() != null)
                .collect(Collectors.toList());
        List<SavedWord> savedWords = savedWordRepository.findByUserIdOrderByNextReviewAtAscCreatedAtDesc(userId);

        Map<Long, Quiz> quizzesById = quizRepository.findAllById(extractIds(quizProgressEntries, UserProgress::getQuizId)).stream()
                .collect(Collectors.toMap(Quiz::getId, quiz -> quiz));
        Map<Long, Lesson> lessonsById = lessonRepository.findAllById(extractIds(lessonProgressEntries, UserProgress::getLessonId)).stream()
                .collect(Collectors.toMap(Lesson::getId, lesson -> lesson));
        Optional<UserLearningStats> stats = userLearningStatsRepository.findByUserId(userId);

        List<MistakePatternDto> patterns = new ArrayList<>();

        buildWeakestQuizTypePattern(quizProgressEntries, quizzesById).ifPresent(patterns::add);
        buildWeakestJlptPattern(quizProgressEntries, quizzesById, lessonProgressEntries, lessonsById).ifPresent(patterns::add);
        buildMemoryFrictionPattern(savedWords).ifPresent(patterns::add);
        buildCompletionDriftPattern(lessonProgressEntries, quizProgressEntries).ifPresent(patterns::add);

        patterns.sort(Comparator
                .comparingInt(this::patternPriority).reversed()
                .thenComparing(MistakePatternDto::getTitle));

        MistakePatternDto dominantPattern = patterns.isEmpty() ? null : patterns.get(0);
        int averageQuizAccuracy = computeAverageQuizAccuracy(quizProgressEntries);
        int dueReviews = countDueReviews(savedWords);
        int inProgressLessons = (int) lessonProgressEntries.stream()
                .filter(progress -> progress.getStatus() == UserProgress.ProgressStatus.IN_PROGRESS)
                .count();
        String confidence = computeConfidenceLabel(quizProgressEntries.size(), lessonProgressEntries.size(), savedWords.size());
        int overallRiskScore = computeOverallRisk(patterns, dueReviews, inProgressLessons);

        return MistakeDnaDto.builder()
                .summary(buildSummary(dominantPattern, confidence, dueReviews, inProgressLessons))
                .confidence(confidence)
                .overallRiskScore(overallRiskScore)
                .averageQuizAccuracy(averageQuizAccuracy)
                .dueReviews(dueReviews)
                .inProgressLessons(inProgressLessons)
                .dominantPatternTitle(dominantPattern != null ? dominantPattern.getTitle() : "No repeated weakness yet")
                .dominantPatternDescription(dominantPattern != null
                        ? dominantPattern.getDescription()
                        : "Keep completing lessons and checkpoint quizzes to reveal a clearer pattern.")
                .nextMoves(buildNextMoves(patterns, averageQuizAccuracy, dueReviews, inProgressLessons))
                .studySignals(buildStudySignals(quizProgressEntries, lessonProgressEntries, savedWords, stats))
                .patterns(patterns)
                .build();
    }

    private Optional<MistakePatternDto> buildWeakestQuizTypePattern(List<UserProgress> quizProgressEntries, Map<Long, Quiz> quizzesById) {
        List<AccuracySample> samples = buildQuizSamples(quizProgressEntries, quizzesById);
        if (samples.isEmpty()) {
            return Optional.empty();
        }

        Map<String, List<AccuracySample>> grouped = samples.stream()
                .collect(Collectors.groupingBy(sample -> sample.quizType, HashMap::new, Collectors.toList()));

        return grouped.entrySet().stream()
                .map(entry -> {
                    int averageAccuracy = averageAccuracy(entry.getValue());
                    String quizType = entry.getKey();
                    return MistakePatternDto.builder()
                            .key("weakest-quiz-type")
                            .title(humanizeQuizType(quizType) + " pressure")
                            .description("Accuracy dips the most on " + humanizeQuizType(quizType).toLowerCase(Locale.ROOT)
                                    + " quizzes, so this looks like the main place where mistakes repeat.")
                            .severity(severityFromAccuracy(averageAccuracy))
                            .metricLabel("Average accuracy")
                            .metricValue(averageAccuracy)
                            .insight("This pattern is based on " + entry.getValue().size() + " checkpoint attempts.")
                            .recommendedAction(recommendActionForQuizType(quizType))
                            .evidence(List.of(
                                    averageAccuracy + "% average score",
                                    entry.getValue().size() + " quiz attempts tracked",
                                    "Most common quiz type under pressure: " + humanizeQuizType(quizType)
                            ))
                            .build();
                })
                .min(Comparator.comparingInt(MistakePatternDto::getMetricValue));
    }

    private Optional<MistakePatternDto> buildWeakestJlptPattern(
            List<UserProgress> quizProgressEntries,
            Map<Long, Quiz> quizzesById,
            List<UserProgress> lessonProgressEntries,
            Map<Long, Lesson> lessonsById
    ) {
        Map<String, List<Integer>> jlptAccuracy = new HashMap<>();

        for (AccuracySample sample : buildQuizSamples(quizProgressEntries, quizzesById)) {
            if (sample.jlptLevel == null || sample.jlptLevel.isBlank()) {
                continue;
            }
            jlptAccuracy.computeIfAbsent(sample.jlptLevel, ignored -> new ArrayList<>()).add(sample.accuracy);
        }

        if (!jlptAccuracy.isEmpty()) {
            return jlptAccuracy.entrySet().stream()
                    .map(entry -> {
                        int averageAccuracy = average(entry.getValue());
                        return MistakePatternDto.builder()
                                .key("weakest-jlpt-band")
                                .title(entry.getKey() + " is where recall slips")
                                .description("Your mistakes cluster more around " + entry.getKey()
                                        + " material than the other levels you have touched recently.")
                                .severity(severityFromAccuracy(averageAccuracy))
                                .metricLabel("Average accuracy")
                                .metricValue(averageAccuracy)
                                .insight("This is calculated from quiz attempts linked to " + entry.getKey() + ".")
                                .recommendedAction("Review one " + entry.getKey()
                                        + " lesson, then re-run a short checkpoint before moving to fresh content.")
                                .evidence(List.of(
                                        averageAccuracy + "% average score at " + entry.getKey(),
                                        entry.getValue().size() + " accuracy samples mapped to this level"
                                ))
                                .build();
                    })
                    .min(Comparator.comparingInt(MistakePatternDto::getMetricValue));
        }

        Map<String, Long> lessonDriftByLevel = lessonProgressEntries.stream()
                .filter(progress -> progress.getStatus() == UserProgress.ProgressStatus.IN_PROGRESS)
                .map(progress -> lessonsById.get(progress.getLessonId()))
                .filter(lesson -> lesson != null && lesson.getJlptLevel() != null && !lesson.getJlptLevel().isBlank())
                .collect(Collectors.groupingBy(Lesson::getJlptLevel, Collectors.counting()));

        return lessonDriftByLevel.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(entry -> MistakePatternDto.builder()
                        .key("weakest-jlpt-band")
                        .title(entry.getKey() + " needs closure")
                        .description("You start " + entry.getKey()
                                + " content, but that level still has the biggest backlog of unfinished lessons.")
                        .severity(entry.getValue() >= 3 ? "HIGH" : "MEDIUM")
                        .metricLabel("In-progress lessons")
                        .metricValue(Math.toIntExact(entry.getValue()))
                        .insight("This fallback pattern appears when quiz history is still too thin.")
                        .recommendedAction("Close one unfinished " + entry.getKey()
                                + " lesson before opening a new track.")
                        .evidence(List.of(
                                entry.getValue() + " unfinished lessons at " + entry.getKey(),
                                "Lesson activity shows stronger drop-off than quiz evidence so far"
                        ))
                        .build());
    }

    private Optional<MistakePatternDto> buildMemoryFrictionPattern(List<SavedWord> savedWords) {
        if (savedWords.isEmpty()) {
            return Optional.empty();
        }

        Instant now = Instant.now();
        long dueReviews = savedWords.stream()
                .filter(word -> word.getNextReviewAt() == null || !word.getNextReviewAt().isAfter(now))
                .count();
        long fragileKanji = savedWords.stream()
                .filter(this::hasKanji)
                .filter(word -> isMemoryFragile(word, now))
                .count();
        long fragileVocabulary = savedWords.stream()
                .filter(word -> !hasKanji(word))
                .filter(word -> isMemoryFragile(word, now))
                .count();

        int metricValue = Math.toIntExact(dueReviews);
        if (metricValue == 0 && fragileKanji == 0 && fragileVocabulary == 0) {
            return Optional.empty();
        }

        return Optional.of(MistakePatternDto.builder()
                .key("memory-friction")
                .title(fragileKanji > fragileVocabulary ? "Kanji memory is under load" : "Review debt is building up")
                .description("The SRS queue suggests recall is getting shaky, especially on items that have stayed due or low-ease for too long.")
                .severity(severityFromReviewPressure(metricValue, fragileKanji + fragileVocabulary))
                .metricLabel("Due reviews")
                .metricValue(metricValue)
                .insight("This pattern uses due cards, low ease factor, and short repetition history.")
                .recommendedAction(fragileKanji > fragileVocabulary
                        ? "Start the next study block with a kanji-only review sweep before new lessons."
                        : "Clear a short review queue first so fresh lessons are not competing with overdue memory work.")
                .evidence(List.of(
                        dueReviews + " cards due now",
                        fragileKanji + " fragile kanji cards",
                        fragileVocabulary + " fragile vocabulary cards"
                ))
                .build());
    }

    private Optional<MistakePatternDto> buildCompletionDriftPattern(List<UserProgress> lessonProgressEntries, List<UserProgress> quizProgressEntries) {
        long inProgressLessons = lessonProgressEntries.stream()
                .filter(progress -> progress.getStatus() == UserProgress.ProgressStatus.IN_PROGRESS)
                .count();
        long repeatedQuizAttempts = quizProgressEntries.stream()
                .filter(progress -> (progress.getAttemptCount() != null ? progress.getAttemptCount() : 0) >= 2)
                .filter(progress -> progress.getStatus() != UserProgress.ProgressStatus.COMPLETED)
                .count();

        if (inProgressLessons == 0 && repeatedQuizAttempts == 0) {
            return Optional.empty();
        }

        int pressure = Math.toIntExact(inProgressLessons + repeatedQuizAttempts);
        return Optional.of(MistakePatternDto.builder()
                .key("completion-drift")
                .title("Start strong, finish late")
                .description("You are engaging with content, but some learning loops stay open longer than they should.")
                .severity(pressure >= 4 ? "HIGH" : "MEDIUM")
                .metricLabel("Open loops")
                .metricValue(pressure)
                .insight("Open lessons and repeated quiz retries often signal where attention gets fragmented.")
                .recommendedAction("Finish one open lesson and one retried quiz before adding new material.")
                .evidence(List.of(
                        inProgressLessons + " lessons still in progress",
                        repeatedQuizAttempts + " quizzes retried without completion"
                ))
                .build());
    }

    private List<AccuracySample> buildQuizSamples(List<UserProgress> quizProgressEntries, Map<Long, Quiz> quizzesById) {
        return quizProgressEntries.stream()
                .filter(progress -> progress.getScore() != null && progress.getTotalScore() != null && progress.getTotalScore() > 0)
                .map(progress -> {
                    Quiz quiz = quizzesById.get(progress.getQuizId());
                    int accuracy = Math.max(0, Math.min(100, Math.round((progress.getScore() * 100.0f) / progress.getTotalScore())));
                    return new AccuracySample(
                            quiz != null && quiz.getQuizType() != null ? quiz.getQuizType().name() : "GENERAL",
                            quiz != null ? quiz.getJlptLevel() : null,
                            accuracy
                    );
                })
                .collect(Collectors.toList());
    }

    private <T> Set<Long> extractIds(List<UserProgress> progressEntries, java.util.function.Function<UserProgress, Long> extractor) {
        return progressEntries.stream()
                .map(extractor)
                .filter(id -> id != null && id > 0)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private int computeAverageQuizAccuracy(List<UserProgress> quizProgressEntries) {
        List<Integer> accuracies = quizProgressEntries.stream()
                .filter(progress -> progress.getScore() != null && progress.getTotalScore() != null && progress.getTotalScore() > 0)
                .map(progress -> Math.max(0, Math.min(100, Math.round((progress.getScore() * 100.0f) / progress.getTotalScore()))))
                .collect(Collectors.toList());
        return average(accuracies);
    }

    private int countDueReviews(List<SavedWord> savedWords) {
        Instant now = Instant.now();
        return (int) savedWords.stream()
                .filter(word -> word.getNextReviewAt() == null || !word.getNextReviewAt().isAfter(now))
                .count();
    }

    private String computeConfidenceLabel(int quizSamples, int lessonSamples, int reviewSamples) {
        int signals = quizSamples + lessonSamples + reviewSamples;
        if (signals >= 18) {
            return "HIGH";
        }
        if (signals >= 8) {
            return "MEDIUM";
        }
        return "LOW";
    }

    private int computeOverallRisk(List<MistakePatternDto> patterns, int dueReviews, int inProgressLessons) {
        int baseRisk = patterns.stream()
                .mapToInt(pattern -> switch (pattern.getSeverity()) {
                    case "HIGH" -> 26;
                    case "MEDIUM" -> 16;
                    default -> 8;
                })
                .sum();
        return Math.max(0, Math.min(100, baseRisk + Math.min(12, dueReviews) + Math.min(10, inProgressLessons * 2)));
    }

    private String buildSummary(MistakePatternDto dominantPattern, String confidence, int dueReviews, int inProgressLessons) {
        if (dominantPattern == null) {
            return "Not enough signals yet. Complete a few quizzes or SRS reviews and the profile will start showing repeated weak spots.";
        }

        return dominantPattern.getTitle() + " stands out most right now. Confidence is " + confidence.toLowerCase(Locale.ROOT)
                + ", with " + dueReviews + " reviews due and " + inProgressLessons + " open lesson loops still active.";
    }

    private List<String> buildNextMoves(List<MistakePatternDto> patterns, int averageQuizAccuracy, int dueReviews, int inProgressLessons) {
        LinkedHashSet<String> nextMoves = patterns.stream()
                .limit(3)
                .map(MistakePatternDto::getRecommendedAction)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        if (averageQuizAccuracy > 0 && averageQuizAccuracy < 70) {
            nextMoves.add("Slow down on checkpoint speed and aim for one clean 80%+ retry before unlocking more volume.");
        }
        if (dueReviews >= 5) {
            nextMoves.add("Use the next 10 minutes on due reviews first so memory debt does not compound.");
        }
        if (inProgressLessons >= 2) {
            nextMoves.add("Pick one in-progress lesson as the single focus for the next session.");
        }

        if (nextMoves.isEmpty()) {
            nextMoves.add("Keep logging quiz attempts and review sessions so the profile can sharpen.");
        }

        return new ArrayList<>(nextMoves);
    }

    private List<String> buildStudySignals(
            List<UserProgress> quizProgressEntries,
            List<UserProgress> lessonProgressEntries,
            List<SavedWord> savedWords,
            Optional<UserLearningStats> stats
    ) {
        int completedLessons = (int) lessonProgressEntries.stream()
                .filter(progress -> progress.getStatus() == UserProgress.ProgressStatus.COMPLETED)
                .count();
        int completedQuizzes = (int) quizProgressEntries.stream()
                .filter(progress -> progress.getStatus() == UserProgress.ProgressStatus.COMPLETED)
                .count();

        List<String> signals = new ArrayList<>();
        signals.add(quizProgressEntries.size() + " quiz attempts tracked");
        signals.add(completedQuizzes + " quizzes completed");
        signals.add(completedLessons + " lessons completed");
        signals.add(savedWords.size() + " saved SRS cards");
        stats.ifPresent(value -> {
            signals.add(value.getCurrentStreak() + " day streak");
            signals.add(value.getTotalXP() + " XP earned");
        });
        return signals;
    }

    private boolean isMemoryFragile(SavedWord word, Instant now) {
        int intervalDays = word.getReviewIntervalDays() != null ? word.getReviewIntervalDays() : 0;
        double easeFactor = word.getEaseFactor() != null ? word.getEaseFactor() : 2.5;
        int repetitions = word.getRepetitionCount() != null ? word.getRepetitionCount() : 0;
        boolean due = word.getNextReviewAt() == null || !word.getNextReviewAt().isAfter(now);
        return due || easeFactor < 2.1 || (intervalDays <= 2 && repetitions <= 1);
    }

    private boolean hasKanji(SavedWord word) {
        String kanji = word.getVocabulary() != null ? word.getVocabulary().getKanji() : null;
        return kanji != null && HAN_PATTERN.matcher(kanji).find();
    }

    private String recommendActionForQuizType(String quizType) {
        return switch (quizType) {
            case "FILL_IN_BLANK" -> "Review grammar frames and redo one fill-in-the-blank set with explanations turned on.";
            case "LISTENING" -> "Replay the audio twice, then shadow it once before retrying the listening checkpoint.";
            case "WRITING" -> "Switch from recognition to production: write the answer before looking at options.";
            case "TRANSLATION" -> "Compare the model answer with your own wording and note where particles or nuance drifted.";
            case "MATCHING" -> "Study the pairs in smaller chunks so recall stays sharp under time pressure.";
            default -> "Review the explanations on the last weak checkpoint and retry it slowly once.";
        };
    }

    private String humanizeQuizType(String quizType) {
        return switch (quizType) {
            case "FILL_IN_BLANK" -> "Fill in the blank";
            case "MULTIPLE_CHOICE" -> "Multiple choice";
            case "LISTENING" -> "Listening";
            case "WRITING" -> "Writing";
            case "TRANSLATION" -> "Translation";
            case "MATCHING" -> "Matching";
            default -> "Quiz";
        };
    }

    private String severityFromAccuracy(int accuracy) {
        if (accuracy < 60) {
            return "HIGH";
        }
        if (accuracy < 78) {
            return "MEDIUM";
        }
        return "LOW";
    }

    private String severityFromReviewPressure(long dueReviews, long fragileCards) {
        if (dueReviews >= 8 || fragileCards >= 10) {
            return "HIGH";
        }
        if (dueReviews >= 3 || fragileCards >= 4) {
            return "MEDIUM";
        }
        return "LOW";
    }

    private int severityWeight(String severity) {
        return switch (severity) {
            case "HIGH" -> 3;
            case "MEDIUM" -> 2;
            default -> 1;
        };
    }

    private int patternPriority(MistakePatternDto pattern) {
        int metricValue = pattern.getMetricValue() != null ? pattern.getMetricValue() : 0;
        int normalizedMetric = "Average accuracy".equalsIgnoreCase(pattern.getMetricLabel())
                ? 100 - metricValue
                : metricValue;
        return severityWeight(pattern.getSeverity()) * 100 + normalizedMetric;
    }

    private int averageAccuracy(List<AccuracySample> samples) {
        return average(samples.stream().map(sample -> sample.accuracy).collect(Collectors.toList()));
    }

    private int average(List<Integer> values) {
        if (values.isEmpty()) {
            return 0;
        }
        return Math.round((float) values.stream().mapToInt(Integer::intValue).average().orElse(0));
    }

    private record AccuracySample(String quizType, String jlptLevel, int accuracy) {
    }
}
