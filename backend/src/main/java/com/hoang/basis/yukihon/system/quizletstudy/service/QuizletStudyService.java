package com.hoang.basis.yukihon.system.quizletstudy.service;

import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.system.quizletstudy.dto.QuizletAnswerRequest;
import com.hoang.basis.yukihon.system.quizletstudy.dto.QuizletCardProgressDto;
import com.hoang.basis.yukihon.system.quizletstudy.dto.QuizletSessionDto;
import com.hoang.basis.yukihon.system.quizletstudy.dto.SessionAnswerRequest;
import com.hoang.basis.yukihon.system.quizletstudy.dto.StartSessionRequest;
import com.hoang.basis.yukihon.system.quizletstudy.entity.QuizletCardProgress;
import com.hoang.basis.yukihon.system.quizletstudy.entity.QuizletStudyLog;
import com.hoang.basis.yukihon.system.quizletstudy.entity.QuizletStudySession;
import com.hoang.basis.yukihon.system.quizletstudy.repository.QuizletCardProgressRepository;
import com.hoang.basis.yukihon.system.quizletstudy.repository.QuizletStudyLogRepository;
import com.hoang.basis.yukihon.system.quizletstudy.repository.QuizletStudySessionRepository;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Quizlet-style (non-SRS) study tracking. Mastery = answered correctly at least
 * {@link #MASTERY_THRESHOLD} times. This service NEVER touches anki_srs_progress.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class QuizletStudyService {

    private static final int MASTERY_THRESHOLD = 2;
    private static final Set<String> MODES = Set.of("FLASHCARD", "LEARN", "MATCH");

    private final QuizletCardProgressRepository repository;
    private final QuizletStudySessionRepository sessionRepository;
    private final QuizletStudyLogRepository logRepository;

    @Transactional(readOnly = true)
    public List<QuizletCardProgressDto> getProgress(Long userId, Long deckId) {
        return repository.findByUserIdAndDeckId(userId, deckId).stream()
                .map(this::toDto)
                .toList();
    }

    /** Legacy session-less answer (kept for backward compatibility). */
    public QuizletCardProgressDto answer(Long userId, QuizletAnswerRequest req) {
        return toDto(applyCardProgress(
                userId, req.getDeckId(), req.getFlashcardId(), Boolean.TRUE.equals(req.getCorrect())));
    }

    // ===================== SESSIONS =====================

    public QuizletSessionDto startSession(Long userId, StartSessionRequest req) {
        String mode = req.getMode() == null ? "LEARN" : req.getMode().toUpperCase();
        if (!MODES.contains(mode)) {
            mode = "LEARN";
        }
        QuizletStudySession s = new QuizletStudySession();
        s.setUserId(userId);
        s.setDeckId(req.getDeckId());
        s.setMode(mode);
        s.setStatus("IN_PROGRESS");
        s.setStartedAt(LocalDateTime.now());
        return toSessionDto(sessionRepository.save(s));
    }

    public QuizletSessionDto answerInSession(Long userId, Long sessionId, SessionAnswerRequest req) {
        QuizletStudySession session = requireSession(userId, sessionId);
        boolean correct = Boolean.TRUE.equals(req.getCorrect());

        // Keep the aggregate per-card progress in sync (mastery tracking).
        applyCardProgress(userId, session.getDeckId(), req.getFlashcardId(), correct);

        QuizletStudyLog log = new QuizletStudyLog();
        log.setSessionId(session.getId());
        log.setFlashcardId(req.getFlashcardId());
        log.setCorrect(correct);
        log.setAnswer(req.getAnswer());
        log.setAnsweredAt(LocalDateTime.now());
        logRepository.save(log);

        session.setTotalAnswered(nvl(session.getTotalAnswered()) + 1);
        if (correct) {
            session.setCorrectCount(nvl(session.getCorrectCount()) + 1);
        } else {
            session.setWrongCount(nvl(session.getWrongCount()) + 1);
        }
        return toSessionDto(sessionRepository.save(session));
    }

    public QuizletSessionDto completeSession(Long userId, Long sessionId) {
        QuizletStudySession session = requireSession(userId, sessionId);
        if (!"COMPLETED".equals(session.getStatus())) {
            LocalDateTime now = LocalDateTime.now();
            session.setStatus("COMPLETED");
            session.setCompletedAt(now);
            session.setDurationSeconds(
                    (int) Duration.between(session.getStartedAt(), now).getSeconds());
            sessionRepository.save(session);
        }
        return toSessionDto(session);
    }

    @Transactional(readOnly = true)
    public List<QuizletSessionDto> getSessions(Long userId, Long deckId) {
        return sessionRepository.findTop20ByUserIdAndDeckIdOrderByStartedAtDesc(userId, deckId).stream()
                .map(this::toSessionDto)
                .toList();
    }

    private QuizletStudySession requireSession(Long userId, Long sessionId) {
        return sessionRepository
                .findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));
    }

    // ===================== SHARED =====================

    private QuizletCardProgress applyCardProgress(Long userId, Long deckId, Long flashcardId, boolean correct) {
        QuizletCardProgress progress = repository
                .findByUserIdAndDeckIdAndFlashcardId(userId, deckId, flashcardId)
                .orElseGet(() -> {
                    QuizletCardProgress p = new QuizletCardProgress();
                    p.setUserId(userId);
                    p.setDeckId(deckId);
                    p.setFlashcardId(flashcardId);
                    return p;
                });

        if (correct) {
            progress.setCorrectCount(nvl(progress.getCorrectCount()) + 1);
        } else {
            progress.setWrongCount(nvl(progress.getWrongCount()) + 1);
        }
        progress.setLastAnswerCorrect(correct);
        progress.setLastStudiedAt(LocalDateTime.now());
        progress.setStatus(correct && progress.getCorrectCount() >= MASTERY_THRESHOLD ? "MASTERED" : "STUDYING");

        return repository.save(progress);
    }

    private int nvl(Integer value) {
        return value != null ? value : 0;
    }

    private QuizletCardProgressDto toDto(QuizletCardProgress p) {
        return QuizletCardProgressDto.builder()
                .flashcardId(p.getFlashcardId())
                .status(p.getStatus())
                .correctCount(p.getCorrectCount())
                .wrongCount(p.getWrongCount())
                .build();
    }

    private QuizletSessionDto toSessionDto(QuizletStudySession s) {
        int total = nvl(s.getTotalAnswered());
        int accuracy = total > 0 ? Math.round(nvl(s.getCorrectCount()) * 100f / total) : 0;
        return QuizletSessionDto.builder()
                .id(s.getId())
                .deckId(s.getDeckId())
                .mode(s.getMode())
                .status(s.getStatus())
                .totalAnswered(total)
                .correctCount(nvl(s.getCorrectCount()))
                .wrongCount(nvl(s.getWrongCount()))
                .accuracy(accuracy)
                .startedAt(s.getStartedAt())
                .completedAt(s.getCompletedAt())
                .durationSeconds(s.getDurationSeconds())
                .build();
    }
}
