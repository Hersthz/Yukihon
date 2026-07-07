package com.hoang.basis.yukihon.system.srs.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoang.basis.yukihon.system.library.entity.Deck;
import com.hoang.basis.yukihon.system.library.repository.DeckItemRepository;
import com.hoang.basis.yukihon.system.library.repository.DeckRepository;
import com.hoang.basis.yukihon.system.library.repository.FlashcardRepository;
import com.hoang.basis.yukihon.system.srs.dto.RescheduleResultDto;
import com.hoang.basis.yukihon.system.srs.entity.AnkiReviewLog;
import com.hoang.basis.yukihon.system.srs.entity.AnkiSrsProgress;
import com.hoang.basis.yukihon.system.srs.repository.AnkiReviewLogRepository;
import com.hoang.basis.yukihon.system.srs.repository.AnkiSrsProgressRepository;
import com.hoang.basis.yukihon.system.srs.repository.AnkiSrsSettingRepository;
import com.hoang.basis.yukihon.system.srs.repository.SrsAlgorithmConfigRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Unit tests for {@link AnkiStudyService#reschedule}: history-replay rebuilds each card's state by
 * replaying its review logs (SM-2 here), and dryRun must never mutate or persist the managed rows.
 */
@ExtendWith(MockitoExtension.class)
class AnkiRescheduleServiceTest {

    private static final long USER_ID = 1L;
    private static final long DECK_ID = 10L;
    private static final long PROGRESS_ID = 500L;

    @Mock
    private DeckRepository deckRepository;

    @Mock
    private DeckItemRepository deckItemRepository;

    @Mock
    private FlashcardRepository flashcardRepository;

    @Mock
    private AnkiSrsProgressRepository progressRepository;

    @Mock
    private AnkiSrsSettingRepository settingRepository;

    @Mock
    private SrsAlgorithmConfigRepository algorithmConfigRepository;

    @Mock
    private AnkiReviewLogRepository reviewLogRepository;

    private AnkiStudyService service;

    @BeforeEach
    void setUp() {
        service = new AnkiStudyService(
                deckRepository,
                deckItemRepository,
                flashcardRepository,
                progressRepository,
                settingRepository,
                algorithmConfigRepository,
                reviewLogRepository,
                new FsrsScheduler(),
                new ObjectMapper());

        Deck deck = mock(Deck.class);
        when(deckRepository.findById(DECK_ID)).thenReturn(Optional.of(deck));
        when(settingRepository.findByUserIdAndDeckId(USER_ID, DECK_ID)).thenReturn(Optional.empty());
        when(algorithmConfigRepository.findByCode("SM2_DEFAULT")).thenReturn(Optional.empty());
    }

    private AnkiSrsProgress progressRow() {
        AnkiSrsProgress p = new AnkiSrsProgress();
        p.setId(PROGRESS_ID);
        p.setUserId(USER_ID);
        p.setDeckId(DECK_ID);
        p.setFlashcardId(100L);
        p.setSide("FORWARD");
        p.setState("NEW");
        p.setIntervalDays(0);
        p.setReviewCount(99); // deliberately stale — replay should overwrite
        return p;
    }

    private AnkiReviewLog log(String rating, LocalDateTime at) {
        AnkiReviewLog l = new AnkiReviewLog();
        l.setProgressId(PROGRESS_ID);
        l.setRating(rating);
        l.setReviewedAt(at);
        return l;
    }

    @Test
    @DisplayName("Apply replays two GOOD reviews: NEW → REVIEW, interval 1d, reviewCount 2, persisted")
    void applyReplaysHistory() {
        AnkiSrsProgress p = progressRow();
        when(progressRepository.findByUserIdAndDeckId(USER_ID, DECK_ID)).thenReturn(List.of(p));
        LocalDateTime base = LocalDateTime.of(2026, 1, 1, 8, 0);
        when(reviewLogRepository.findByUserIdAndDeckIdOrderByReviewedAtAsc(USER_ID, DECK_ID))
                .thenReturn(List.of(log("GOOD", base), log("GOOD", base.plusMinutes(10))));

        RescheduleResultDto res = service.reschedule(USER_ID, DECK_ID, false);

        assertThat(res.isDryRun()).isFalse();
        assertThat(res.getCardsProcessed()).isEqualTo(1);
        assertThat(res.getCardsChanged()).isEqualTo(1);

        ArgumentCaptor<List<AnkiSrsProgress>> captor = ArgumentCaptor.forClass(List.class);
        verify(progressRepository).saveAll(captor.capture());
        AnkiSrsProgress saved = captor.getValue().get(0);
        assertThat(saved.getState()).isEqualTo("REVIEW");
        assertThat(saved.getIntervalDays()).isEqualTo(1);
        assertThat(saved.getReviewCount()).isEqualTo(2);
    }

    @Test
    @DisplayName("dryRun previews the diff but never persists or mutates the managed row")
    void dryRunDoesNotPersist() {
        AnkiSrsProgress p = progressRow();
        when(progressRepository.findByUserIdAndDeckId(USER_ID, DECK_ID)).thenReturn(List.of(p));
        LocalDateTime base = LocalDateTime.of(2026, 1, 1, 8, 0);
        when(reviewLogRepository.findByUserIdAndDeckIdOrderByReviewedAtAsc(USER_ID, DECK_ID))
                .thenReturn(List.of(log("GOOD", base), log("GOOD", base.plusMinutes(10))));

        RescheduleResultDto res = service.reschedule(USER_ID, DECK_ID, true);

        assertThat(res.isDryRun()).isTrue();
        assertThat(res.getCardsChanged()).isEqualTo(1);
        assertThat(res.getChanges()).hasSize(1);
        assertThat(res.getChanges().get(0).getNewState()).isEqualTo("REVIEW");
        // Managed row is untouched, and nothing is written.
        assertThat(p.getState()).isEqualTo("NEW");
        assertThat(p.getReviewCount()).isEqualTo(99);
        verify(progressRepository, never()).saveAll(any());
    }

    @Test
    @DisplayName("Cards with no review history are skipped, not rescheduled")
    void skipsCardsWithoutHistory() {
        AnkiSrsProgress p = progressRow();
        when(progressRepository.findByUserIdAndDeckId(USER_ID, DECK_ID)).thenReturn(List.of(p));
        when(reviewLogRepository.findByUserIdAndDeckIdOrderByReviewedAtAsc(USER_ID, DECK_ID))
                .thenReturn(List.of());

        RescheduleResultDto res = service.reschedule(USER_ID, DECK_ID, false);

        assertThat(res.getCardsProcessed()).isEqualTo(1);
        assertThat(res.getCardsChanged()).isZero();
        assertThat(res.getCardsSkippedNoHistory()).isEqualTo(1);
        verify(progressRepository, never()).saveAll(any());
    }

    @Test
    @DisplayName("FSRS reschedule seeds stability/difficulty from replayed grades")
    void fsrsReplaySeedsMemoryState() {
        // Point the deck setting at an FSRS config so resolveAlgorithmType returns FSRS.
        var setting = new com.hoang.basis.yukihon.system.srs.entity.AnkiSrsSetting();
        setting.setUserId(USER_ID);
        setting.setDeckId(DECK_ID);
        setting.setAlgorithmConfigId(7L);
        when(settingRepository.findByUserIdAndDeckId(USER_ID, DECK_ID)).thenReturn(Optional.of(setting));
        var cfg = new com.hoang.basis.yukihon.system.srs.entity.SrsAlgorithmConfig();
        cfg.setAlgorithmType("FSRS");
        when(algorithmConfigRepository.findById(7L)).thenReturn(Optional.of(cfg));

        AnkiSrsProgress p = progressRow();
        when(progressRepository.findByUserIdAndDeckId(USER_ID, DECK_ID)).thenReturn(List.of(p));
        LocalDateTime base = LocalDateTime.of(2026, 1, 1, 8, 0);
        when(reviewLogRepository.findByUserIdAndDeckIdOrderByReviewedAtAsc(USER_ID, DECK_ID))
                .thenReturn(List.of(log("GOOD", base), log("GOOD", base.plusDays(3))));

        RescheduleResultDto res = service.reschedule(USER_ID, DECK_ID, false);

        assertThat(res.getAlgorithmType()).isEqualTo("FSRS");
        ArgumentCaptor<List<AnkiSrsProgress>> captor = ArgumentCaptor.forClass(List.class);
        verify(progressRepository).saveAll(captor.capture());
        AnkiSrsProgress saved = captor.getValue().get(0);
        assertThat(saved.getAlgorithmType()).isEqualTo("FSRS");
        assertThat(saved.getStability()).isNotNull().isGreaterThan(0.0);
        assertThat(saved.getDifficulty()).isNotNull();
    }

    @Test
    @DisplayName("Unused mock guard: flashcard/deckItem repos are not consulted during reschedule")
    void doesNotTouchCardRepos() {
        AnkiSrsProgress p = progressRow();
        when(progressRepository.findByUserIdAndDeckId(USER_ID, DECK_ID)).thenReturn(List.of(p));
        when(reviewLogRepository.findByUserIdAndDeckIdOrderByReviewedAtAsc(USER_ID, DECK_ID))
                .thenReturn(List.of(log("GOOD", LocalDateTime.of(2026, 1, 1, 8, 0))));

        service.reschedule(USER_ID, DECK_ID, false);

        verify(flashcardRepository, never()).findById(anyLong());
        verify(deckItemRepository, never()).findByDeckIdAndIsDeletedFalseOrderByOrderIndexAsc(eq(DECK_ID));
    }
}
