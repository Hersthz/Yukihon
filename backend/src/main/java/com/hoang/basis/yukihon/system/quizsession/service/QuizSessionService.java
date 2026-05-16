package com.hoang.basis.yukihon.system.quizsession.service;

import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.system.quizsession.dto.QuizSessionDto;
import com.hoang.basis.yukihon.system.quizsession.dto.QuizSessionRequest;
import com.hoang.basis.yukihon.system.quizsession.entity.QuizSession;
import com.hoang.basis.yukihon.system.quizsession.repository.QuizSessionRepository;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class QuizSessionService {

    private final QuizSessionRepository quizSessionRepository;
    private final UserRepository userRepository;

    public QuizSessionDto recordSession(Long userId, QuizSessionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        int totalQuestions = Math.max(1, request.getTotalQuestions());
        int correctCount = Math.max(0, Math.min(request.getCorrectCount(), totalQuestions));

        QuizSession session = QuizSession.builder()
                .user(user)
                .mode(normalizeMode(request.getMode()))
                .totalQuestions(totalQuestions)
                .correctCount(correctCount)
                .accuracyRate(calculateAccuracy(correctCount, totalQuestions))
                .weakestPattern(normalizePattern(request.getWeakestPattern()))
                .build();

        return toDto(quizSessionRepository.save(session));
    }

    @Transactional(readOnly = true)
    public List<QuizSessionDto> getRecentSessions(Long userId, Integer limit) {
        int safeLimit = Math.max(1, Math.min(limit != null ? limit : 10, 50));
        return quizSessionRepository.findByUserIdOrderByCompletedAtDesc(userId, PageRequest.of(0, safeLimit)).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private String normalizeMode(String mode) {
        return mode == null ? "QUICK" : mode.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizePattern(String pattern) {
        return pattern == null || pattern.isBlank() ? null : pattern.trim().toLowerCase(Locale.ROOT);
    }

    private BigDecimal calculateAccuracy(int correctCount, int totalQuestions) {
        return BigDecimal.valueOf(correctCount * 100.0 / totalQuestions)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private QuizSessionDto toDto(QuizSession session) {
        Long userId = session.getUserId() != null ? session.getUserId() : session.getUser().getId();

        return QuizSessionDto.builder()
                .id(session.getId())
                .userId(userId)
                .mode(session.getMode())
                .totalQuestions(session.getTotalQuestions())
                .correctCount(session.getCorrectCount())
                .accuracyRate(session.getAccuracyRate().doubleValue())
                .weakestPattern(session.getWeakestPattern())
                .startedAt(session.getStartedAt() != null ? session.getStartedAt().toString() : null)
                .completedAt(session.getCompletedAt() != null ? session.getCompletedAt().toString() : null)
                .build();
    }
}
