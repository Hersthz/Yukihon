package com.hoang.basis.yukihon.system.quizletstudy.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.system.quizletstudy.dto.QuizletSessionDto;
import com.hoang.basis.yukihon.system.quizletstudy.dto.SessionAnswerRequest;
import com.hoang.basis.yukihon.system.quizletstudy.dto.StartSessionRequest;
import com.hoang.basis.yukihon.system.quizletstudy.entity.QuizletCardProgress;
import com.hoang.basis.yukihon.system.quizletstudy.entity.QuizletStudyLog;
import com.hoang.basis.yukihon.system.quizletstudy.entity.QuizletStudySession;
import com.hoang.basis.yukihon.system.quizletstudy.repository.QuizletCardProgressRepository;
import com.hoang.basis.yukihon.system.quizletstudy.repository.QuizletStudyLogRepository;
import com.hoang.basis.yukihon.system.quizletstudy.repository.QuizletStudySessionRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Unit tests for the Quizlet session flow: start → answer (tally + log + card progress) → complete.
 * Repositories are mocked; the session save() echoes the entity so running counters accumulate.
 */
@ExtendWith(MockitoExtension.class)
class QuizletStudyServiceTest {

    private static final long USER_ID = 1L;
    private static final long DECK_ID = 10L;
    private static final long SESSION_ID = 77L;

    @Mock
    private QuizletCardProgressRepository repository;

    @Mock
    private QuizletStudySessionRepository sessionRepository;

    @Mock
    private QuizletStudyLogRepository logRepository;

    private QuizletStudyService service;

    @BeforeEach
    void setUp() {
        service = new QuizletStudyService(repository, sessionRepository, logRepository);
        lenient().when(sessionRepository.save(any(QuizletStudySession.class))).thenAnswer(inv -> {
            QuizletStudySession s = inv.getArgument(0);
            if (s.getId() == null) {
                s.setId(SESSION_ID);
            }
            return s;
        });
    }

    @Test
    @DisplayName("startSession normalises an unknown mode to LEARN and marks it in progress")
    void startSessionNormalisesMode() {
        StartSessionRequest req = new StartSessionRequest();
        req.setDeckId(DECK_ID);
        req.setMode("bogus");

        QuizletSessionDto dto = service.startSession(USER_ID, req);

        assertThat(dto.getMode()).isEqualTo("LEARN");
        assertThat(dto.getStatus()).isEqualTo("IN_PROGRESS");
        assertThat(dto.getId()).isEqualTo(SESSION_ID);
    }

    @Test
    @DisplayName("answerInSession bumps the tally, logs the answer and updates card progress")
    void answerInSessionUpdatesTallyLogAndProgress() {
        QuizletStudySession session = openSession();
        when(sessionRepository.findByIdAndUserId(SESSION_ID, USER_ID)).thenReturn(Optional.of(session));
        when(repository.findByUserIdAndDeckIdAndFlashcardId(USER_ID, DECK_ID, 100L))
                .thenReturn(Optional.empty());
        when(repository.save(any(QuizletCardProgress.class))).thenAnswer(inv -> inv.getArgument(0));

        SessionAnswerRequest req = new SessionAnswerRequest();
        req.setFlashcardId(100L);
        req.setCorrect(true);
        req.setAnswer("chó");

        QuizletSessionDto dto = service.answerInSession(USER_ID, SESSION_ID, req);

        assertThat(dto.getTotalAnswered()).isEqualTo(1);
        assertThat(dto.getCorrectCount()).isEqualTo(1);
        assertThat(dto.getAccuracy()).isEqualTo(100);
        verify(logRepository, times(1)).save(any(QuizletStudyLog.class));
        verify(repository, times(1)).save(any(QuizletCardProgress.class));
    }

    @Test
    @DisplayName("completeSession stamps completed status and a non-negative duration")
    void completeSessionStampsStatus() {
        QuizletStudySession session = openSession();
        session.setTotalAnswered(4);
        session.setCorrectCount(3);
        when(sessionRepository.findByIdAndUserId(SESSION_ID, USER_ID)).thenReturn(Optional.of(session));

        QuizletSessionDto dto = service.completeSession(USER_ID, SESSION_ID);

        assertThat(dto.getStatus()).isEqualTo("COMPLETED");
        assertThat(dto.getCompletedAt()).isNotNull();
        assertThat(dto.getDurationSeconds()).isNotNull().isGreaterThanOrEqualTo(0);
        assertThat(dto.getAccuracy()).isEqualTo(75);
    }

    @Test
    @DisplayName("A session belonging to another user is not found")
    void foreignSessionRejected() {
        when(sessionRepository.findByIdAndUserId(SESSION_ID, USER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.completeSession(USER_ID, SESSION_ID))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(sessionRepository, never()).save(any());
    }

    private QuizletStudySession openSession() {
        QuizletStudySession s = new QuizletStudySession();
        s.setId(SESSION_ID);
        s.setUserId(USER_ID);
        s.setDeckId(DECK_ID);
        s.setMode("LEARN");
        s.setStatus("IN_PROGRESS");
        s.setStartedAt(java.time.LocalDateTime.now().minusMinutes(2));
        return s;
    }
}
