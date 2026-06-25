package com.hoang.basis.yukihon.system.quizletstudy.service;

import com.hoang.basis.yukihon.system.quizletstudy.dto.QuizletAnswerRequest;
import com.hoang.basis.yukihon.system.quizletstudy.dto.QuizletCardProgressDto;
import com.hoang.basis.yukihon.system.quizletstudy.entity.QuizletCardProgress;
import com.hoang.basis.yukihon.system.quizletstudy.repository.QuizletCardProgressRepository;
import java.time.LocalDateTime;
import java.util.List;
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

    private final QuizletCardProgressRepository repository;

    @Transactional(readOnly = true)
    public List<QuizletCardProgressDto> getProgress(Long userId, Long deckId) {
        return repository.findByUserIdAndDeckId(userId, deckId).stream()
                .map(this::toDto)
                .toList();
    }

    public QuizletCardProgressDto answer(Long userId, QuizletAnswerRequest req) {
        QuizletCardProgress progress = repository
                .findByUserIdAndDeckIdAndFlashcardId(userId, req.getDeckId(), req.getFlashcardId())
                .orElseGet(() -> {
                    QuizletCardProgress p = new QuizletCardProgress();
                    p.setUserId(userId);
                    p.setDeckId(req.getDeckId());
                    p.setFlashcardId(req.getFlashcardId());
                    return p;
                });

        boolean correct = Boolean.TRUE.equals(req.getCorrect());
        if (correct) {
            progress.setCorrectCount(nvl(progress.getCorrectCount()) + 1);
        } else {
            progress.setWrongCount(nvl(progress.getWrongCount()) + 1);
        }
        progress.setLastAnswerCorrect(correct);
        progress.setLastStudiedAt(LocalDateTime.now());
        progress.setStatus(correct && progress.getCorrectCount() >= MASTERY_THRESHOLD ? "MASTERED" : "STUDYING");

        return toDto(repository.save(progress));
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
}
