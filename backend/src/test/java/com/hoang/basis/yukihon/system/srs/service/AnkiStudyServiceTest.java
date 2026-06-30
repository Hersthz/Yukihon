package com.hoang.basis.yukihon.system.srs.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoang.basis.yukihon.system.library.entity.Deck;
import com.hoang.basis.yukihon.system.library.entity.Flashcard;
import com.hoang.basis.yukihon.system.library.repository.DeckItemRepository;
import com.hoang.basis.yukihon.system.library.repository.DeckRepository;
import com.hoang.basis.yukihon.system.library.repository.FlashcardRepository;
import com.hoang.basis.yukihon.system.srs.dto.AnkiReviewRequest;
import com.hoang.basis.yukihon.system.srs.entity.AnkiSrsProgress;
import com.hoang.basis.yukihon.system.srs.repository.AnkiReviewLogRepository;
import com.hoang.basis.yukihon.system.srs.repository.AnkiSrsProgressRepository;
import com.hoang.basis.yukihon.system.srs.repository.AnkiSrsSettingRepository;
import com.hoang.basis.yukihon.system.srs.repository.SrsAlgorithmConfigRepository;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Unit tests for the SM-2 scheduler. Drives the public {@link AnkiStudyService#review} with mocked
 * repositories and the default config, then captures the saved {@link AnkiSrsProgress} to assert the
 * state machine and interval math (NEW → LEARNING → REVIEW ↔ RELEARNING).
 */
@ExtendWith(MockitoExtension.class)
class AnkiStudyServiceTest {

    private static final long USER_ID = 1L;
    private static final long DECK_ID = 10L;
    private static final long FC_ID = 100L;

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

        Flashcard flashcard = mock(Flashcard.class);
        when(flashcard.getId()).thenReturn(FC_ID);
        Deck deck = mock(Deck.class);
        when(deck.getId()).thenReturn(DECK_ID);

        when(flashcardRepository.findById(FC_ID)).thenReturn(Optional.of(flashcard));
        when(deckRepository.findById(DECK_ID)).thenReturn(Optional.of(deck));
        when(settingRepository.findByUserIdAndDeckId(USER_ID, DECK_ID)).thenReturn(Optional.empty());
        when(algorithmConfigRepository.findByCode("SM2_DEFAULT")).thenReturn(Optional.empty());
        when(progressRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(reviewLogRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    private AnkiReviewRequest request(String rating) {
        AnkiReviewRequest req = new AnkiReviewRequest();
        req.setDeckId(DECK_ID);
        req.setFlashcardId(FC_ID);
        req.setRating(rating);
        return req;
    }

    /** Stub an existing progress row; returns it so the test can pre-set fields. */
    private AnkiSrsProgress existing(String state, int intervalDays, double ease) {
        AnkiSrsProgress p = new AnkiSrsProgress();
        p.setUserId(USER_ID);
        p.setDeckId(DECK_ID);
        p.setFlashcardId(FC_ID);
        p.setState(state);
        p.setIntervalDays(intervalDays);
        p.setEaseFactor(ease);
        p.setLapses(0);
        p.setReviewCount(3);
        when(progressRepository.findByUserIdAndDeckIdAndFlashcardId(USER_ID, DECK_ID, FC_ID))
                .thenReturn(Optional.of(p));
        return p;
    }

    private void newCard() {
        when(progressRepository.findByUserIdAndDeckIdAndFlashcardId(USER_ID, DECK_ID, FC_ID))
                .thenReturn(Optional.empty());
    }

    private AnkiSrsProgress capturePersisted() {
        ArgumentCaptor<AnkiSrsProgress> captor = ArgumentCaptor.forClass(AnkiSrsProgress.class);
        verify(progressRepository).save(captor.capture());
        return captor.getValue();
    }

    @Test
    @DisplayName("NEW + GOOD advances to the 2nd learning step (10m), still LEARNING")
    void newCardGood() {
        newCard();
        LocalDateTime before = LocalDateTime.now();

        service.review(USER_ID, request("GOOD"));

        AnkiSrsProgress saved = capturePersisted();
        assertThat(saved.getState()).isEqualTo("LEARNING");
        assertThat(saved.getLearningStepIndex()).isEqualTo(1);
        assertThat(saved.getReviewCount()).isEqualTo(1);
        assertThat(saved.getFirstLearnedAt()).isNotNull();
        assertThat(ChronoUnit.MINUTES.between(before, saved.getNextReviewAt())).isBetween(9L, 11L);
    }

    @Test
    @DisplayName("NEW + AGAIN stays at step 0 with the ~1m relearn delay")
    void newCardAgain() {
        newCard();
        LocalDateTime before = LocalDateTime.now();

        service.review(USER_ID, request("AGAIN"));

        AnkiSrsProgress saved = capturePersisted();
        assertThat(saved.getState()).isEqualTo("LEARNING");
        assertThat(saved.getLearningStepIndex()).isZero();
        assertThat(ChronoUnit.SECONDS.between(before, saved.getNextReviewAt())).isBetween(50L, 70L);
    }

    @Test
    @DisplayName("NEW + EASY graduates straight to REVIEW with the easy interval (4d)")
    void newCardEasy() {
        newCard();

        service.review(USER_ID, request("EASY"));

        AnkiSrsProgress saved = capturePersisted();
        assertThat(saved.getState()).isEqualTo("REVIEW");
        assertThat(saved.getIntervalDays()).isEqualTo(4);
    }

    @Test
    @DisplayName("LEARNING at the last step + GOOD graduates to REVIEW (1d)")
    void learningGraduates() {
        AnkiSrsProgress p = existing("LEARNING", 0, 2.5);
        p.setLearningStepIndex(1); // last of [1m, 10m]

        service.review(USER_ID, request("GOOD"));

        AnkiSrsProgress saved = capturePersisted();
        assertThat(saved.getState()).isEqualTo("REVIEW");
        assertThat(saved.getIntervalDays()).isEqualTo(1);
    }

    @Test
    @DisplayName("REVIEW + GOOD multiplies the interval by ease (10 → 25), ease unchanged")
    void reviewGood() {
        existing("REVIEW", 10, 2.5);

        service.review(USER_ID, request("GOOD"));

        AnkiSrsProgress saved = capturePersisted();
        assertThat(saved.getState()).isEqualTo("REVIEW");
        assertThat(saved.getIntervalDays()).isEqualTo(25); // round(10 * 2.5 * 1.0)
        assertThat(saved.getEaseFactor()).isEqualTo(2.5);
    }

    @Test
    @DisplayName("REVIEW + HARD uses the 1.2 multiplier and drops ease by 0.15")
    void reviewHard() {
        existing("REVIEW", 10, 2.5);

        service.review(USER_ID, request("HARD"));

        AnkiSrsProgress saved = capturePersisted();
        assertThat(saved.getIntervalDays()).isEqualTo(12); // round(10 * 1.2)
        assertThat(saved.getEaseFactor()).isCloseTo(2.35, within(1e-9));
    }

    @Test
    @DisplayName("REVIEW + EASY applies the easy bonus and bumps ease by 0.15")
    void reviewEasy() {
        existing("REVIEW", 10, 2.5);

        service.review(USER_ID, request("EASY"));

        AnkiSrsProgress saved = capturePersisted();
        assertThat(saved.getIntervalDays()).isEqualTo(33); // round(10 * 2.5 * 1.3)
        assertThat(saved.getEaseFactor()).isCloseTo(2.65, within(1e-9));
    }

    @Test
    @DisplayName("REVIEW + AGAIN lapses, drops ease, and enters RELEARNING")
    void reviewAgain() {
        existing("REVIEW", 10, 2.5);

        service.review(USER_ID, request("AGAIN"));

        AnkiSrsProgress saved = capturePersisted();
        assertThat(saved.getState()).isEqualTo("RELEARNING");
        assertThat(saved.getLapses()).isEqualTo(1);
        assertThat(saved.getEaseFactor()).isCloseTo(2.30, within(1e-9));
        assertThat(saved.getIntervalDays()).isEqualTo(1); // newInterval defaults to 0 → floor of 1
    }

    @Test
    @DisplayName("Ease never falls below the 1.3 floor on repeated AGAIN")
    void easeFloor() {
        existing("REVIEW", 10, 1.3);

        service.review(USER_ID, request("AGAIN"));

        AnkiSrsProgress saved = capturePersisted();
        assertThat(saved.getEaseFactor()).isCloseTo(1.3, within(1e-9));
    }

    @Test
    @DisplayName("Unknown rating is treated as GOOD")
    void unknownRatingFallsBackToGood() {
        newCard();

        service.review(USER_ID, request("BOGUS"));

        AnkiSrsProgress saved = capturePersisted();
        assertThat(saved.getState()).isEqualTo("LEARNING");
        assertThat(saved.getLearningStepIndex()).isEqualTo(1);
        assertThat(saved.getLastRating()).isEqualTo("GOOD");
    }
}
