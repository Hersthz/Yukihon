package com.hoang.basis.yukihon.system.quizattempt.service;

import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.system.quiz.entity.Quiz;
import com.hoang.basis.yukihon.system.quiz.repository.QuizRepository;
import com.hoang.basis.yukihon.system.quizattempt.dto.QuizAttemptDto;
import com.hoang.basis.yukihon.system.quizattempt.dto.QuizAttemptRequest;
import com.hoang.basis.yukihon.system.quizattempt.entity.QuizAttempt;
import com.hoang.basis.yukihon.system.quizattempt.repository.QuizAttemptRepository;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import com.hoang.basis.yukihon.system.userprogress.entity.UserProgress;
import com.hoang.basis.yukihon.system.userprogress.repository.UserProgressRepository;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.TreeSet;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class QuizAttemptService {

    private static final int MAX_SCORE = 100;
    private static final Pattern HAN_PATTERN = Pattern.compile("\\p{IsHan}");
    private static final Set<String> PARTICLES = Set.of("は", "が", "を", "に", "で", "と", "へ", "から", "まで", "より", "も", "の");

    private final QuizAttemptRepository quizAttemptRepository;
    private final UserRepository userRepository;
    private final QuizRepository quizRepository;
    private final UserProgressRepository userProgressRepository;

    public QuizAttemptDto recordAttempt(Long userId, QuizAttemptRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Quiz quiz = quizRepository
                .findById(request.getQuizId())
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + request.getQuizId()));

        String answer = request.getAnswer().trim();
        boolean correct = isCorrect(answer, quiz.getCorrectAnswer(), quiz.getQuizType());
        String mistakePattern = correct ? null : inferMistakePattern(quiz);
        int score = correct ? MAX_SCORE : 0;

        QuizAttempt attempt = QuizAttempt.builder()
                .user(user)
                .quiz(quiz)
                .answer(answer)
                .correct(correct)
                .score(score)
                .mistakePattern(mistakePattern)
                .build();

        QuizAttempt saved = quizAttemptRepository.save(attempt);
        syncQuizProgress(user, quiz, saved);
        log.info("Recorded quiz attempt userId={} quizId={} correct={}", userId, quiz.getId(), correct);
        return convertToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<QuizAttemptDto> getRecentAttempts(Long userId) {
        return getRecentAttempts(userId, 20, null);
    }

    @Transactional(readOnly = true)
    public List<QuizAttemptDto> getRecentAttempts(Long userId, Integer limit, Boolean correct) {
        int safeLimit = Math.max(1, Math.min(limit != null ? limit : 20, 100));
        return quizAttemptRepository
                .findRecentByUserIdAndCorrect(userId, correct, PageRequest.of(0, safeLimit))
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private boolean isCorrect(String submittedAnswer, String correctAnswer, Quiz.QuizType quizType) {
        // MATCHING answers are unordered sets of pairs ("A->1, B->2"); compare order-insensitively.
        if (quizType == Quiz.QuizType.MATCHING) {
            return tokenSet(submittedAnswer).equals(tokenSet(correctAnswer));
        }
        return normalizeAnswer(submittedAnswer).equals(normalizeAnswer(correctAnswer));
    }

    private Set<String> tokenSet(String value) {
        String normalized = normalizeAnswer(value);
        if (normalized.isEmpty()) {
            return Set.of();
        }
        return Arrays.stream(normalized.split("[,;|/]+"))
                .map(String::trim)
                .filter(token -> !token.isEmpty())
                .collect(Collectors.toCollection(TreeSet::new));
    }

    private String normalizeAnswer(String value) {
        return value == null ? "" : value.trim().replaceAll("\\s+", " ").toLowerCase(Locale.ROOT);
    }

    private String inferMistakePattern(Quiz quiz) {
        Quiz.QuizType quizType = quiz.getQuizType();
        String searchableText = joinText(
                        quiz.getTitle(), quiz.getDescription(), quiz.getQuestion(), quiz.getCorrectAnswer())
                .toLowerCase(Locale.ROOT);

        if (quizType == Quiz.QuizType.LISTENING || containsAny(searchableText, "listening", "audio", "hear", "nghe")) {
            return "listening";
        }

        String correctAnswer =
                quiz.getCorrectAnswer() == null ? "" : quiz.getCorrectAnswer().trim();
        if (PARTICLES.contains(correctAnswer)
                || containsAny(searchableText, "particle", "particles", "trợ từ", "tro tu")) {
            return "particle";
        }

        if (containsAny(
                searchableText,
                "reading",
                "hiragana",
                "romaji",
                "pronunciation",
                "yomi",
                "onyomi",
                "kunyomi",
                "đọc",
                "doc")) {
            return "reading";
        }

        if (quizType == Quiz.QuizType.FILL_IN_BLANK
                || quizType == Quiz.QuizType.TRANSLATION
                || containsAny(searchableText, "grammar", "pattern", "sentence", "ngữ pháp", "ngu phap")) {
            return "grammar";
        }

        if (quizType == Quiz.QuizType.MULTIPLE_CHOICE
                || containsAny(searchableText, "meaning", "vocabulary", "word", "từ vựng", "tu vung")) {
            return "vocabulary";
        }

        if (HAN_PATTERN.matcher(searchableText).find()) {
            return "reading";
        }

        return "grammar";
    }

    private boolean containsAny(String value, String... needles) {
        for (String needle : needles) {
            if (value.contains(needle)) {
                return true;
            }
        }
        return false;
    }

    private String joinText(String... values) {
        StringBuilder builder = new StringBuilder();
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                builder.append(value).append(' ');
            }
        }
        return builder.toString();
    }

    private void syncQuizProgress(User user, Quiz quiz, QuizAttempt attempt) {
        UserProgress progress = userProgressRepository
                .findByUserIdAndQuizId(user.getId(), quiz.getId())
                .orElseGet(() -> UserProgress.builder()
                        .user(user)
                        .quizId(quiz.getId())
                        .progressType("quiz")
                        .attemptCount(0)
                        .status(UserProgress.ProgressStatus.NOT_STARTED)
                        .build());

        boolean alreadyCompleted = progress.getStatus() == UserProgress.ProgressStatus.COMPLETED;
        progress.setScore(attempt.getScore());
        progress.setTotalScore(MAX_SCORE);
        progress.setAttemptCount((progress.getAttemptCount() != null ? progress.getAttemptCount() : 0) + 1);
        progress.setNotes(
                attempt.isCorrect()
                        ? "Last quiz attempt was correct."
                        : "Last missed pattern: " + attempt.getMistakePattern());

        if (attempt.isCorrect()) {
            progress.setStatus(UserProgress.ProgressStatus.COMPLETED);
            if (progress.getCompletedAt() == null) {
                progress.setCompletedAt(Instant.now());
            }
        } else if (!alreadyCompleted) {
            progress.setStatus(UserProgress.ProgressStatus.IN_PROGRESS);
        }

        userProgressRepository.save(progress);
    }

    private QuizAttemptDto convertToDto(QuizAttempt attempt) {
        Long userId = attempt.getUserId() != null
                ? attempt.getUserId()
                : attempt.getUser().getId();
        Long quizId = attempt.getQuizId() != null
                ? attempt.getQuizId()
                : attempt.getQuiz().getId();

        return QuizAttemptDto.builder()
                .id(attempt.getId())
                .userId(userId)
                .quizId(quizId)
                .answer(attempt.getAnswer())
                .correct(attempt.isCorrect())
                .score(attempt.getScore())
                .mistakePattern(attempt.getMistakePattern())
                .attemptedAt(
                        attempt.getAttemptedAt() != null
                                ? attempt.getAttemptedAt().toString()
                                : null)
                .build();
    }
}
