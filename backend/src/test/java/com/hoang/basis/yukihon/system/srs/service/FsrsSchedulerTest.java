package com.hoang.basis.yukihon.system.srs.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.hoang.basis.yukihon.system.srs.entity.AnkiSrsProgress;
import java.time.LocalDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * Unit tests for the FSRS-5 scheduler. Pure math — no Spring context or DB. Verifies the first
 * exposure seeds stability/difficulty, subsequent reviews grow stability, AGAIN triggers relearning,
 * and the interval honours the "interval ≈ round(stability) at retention 0.9" golden rule.
 */
class FsrsSchedulerTest {

    private final FsrsScheduler scheduler = new FsrsScheduler();
    private final LocalDateTime now = LocalDateTime.of(2026, 1, 1, 9, 0);

    private AnkiSrsProgress newCard() {
        AnkiSrsProgress p = new AnkiSrsProgress();
        p.setState("NEW");
        return p;
    }

    @Test
    @DisplayName("First GOOD review seeds stability/difficulty and schedules into REVIEW")
    void firstReviewSeedsMemoryState() {
        AnkiSrsProgress p = newCard();

        scheduler.apply(p, "GOOD", 0.9, 36500, now);

        assertThat(p.getStability()).isNotNull().isGreaterThan(0.0);
        assertThat(p.getDifficulty()).isNotNull().isBetween(1.0, 10.0);
        assertThat(p.getAlgorithmType()).isEqualTo("FSRS");
        assertThat(p.getState()).isEqualTo("REVIEW");
        assertThat(p.getIntervalDays()).isGreaterThanOrEqualTo(1);
        assertThat(p.getReviewCount()).isEqualTo(1);
        assertThat(p.getNextReviewAt()).isAfter(now);
    }

    @Test
    @DisplayName("Second GOOD review (on a due card) grows stability and lengthens the interval")
    void reviewGrowsStability() {
        AnkiSrsProgress p = newCard();
        scheduler.apply(p, "GOOD", 0.9, 36500, now);
        double s1 = p.getStability();
        int i1 = p.getIntervalDays();

        // Review again after the first interval elapses.
        LocalDateTime later = now.plusDays(Math.max(1, i1));
        scheduler.apply(p, "GOOD", 0.9, 36500, later);

        assertThat(p.getStability()).isGreaterThan(s1);
        assertThat(p.getIntervalDays()).isGreaterThanOrEqualTo(i1);
        assertThat(p.getState()).isEqualTo("REVIEW");
    }

    @Test
    @DisplayName("AGAIN on a review card drops it to RELEARNING, bumps lapses, shrinks stability")
    void againTriggersRelearning() {
        AnkiSrsProgress p = newCard();
        scheduler.apply(p, "GOOD", 0.9, 36500, now);
        scheduler.apply(p, "GOOD", 0.9, 36500, now.plusDays(Math.max(1, p.getIntervalDays())));
        double sBefore = p.getStability();

        scheduler.apply(p, "AGAIN", 0.9, 36500, now.plusDays(30));

        assertThat(p.getState()).isEqualTo("RELEARNING");
        assertThat(p.getLapses()).isEqualTo(1);
        assertThat(p.getStability()).isLessThanOrEqualTo(sBefore);
        // Relearning is scheduled within the same day (10-minute step), not days out.
        assertThat(p.getNextReviewAt()).isBefore(now.plusDays(31));
    }

    @Test
    @DisplayName("intervalForStability honours the golden rule: interval ≈ round(stability) at 0.9")
    void goldenRuleInterval() {
        assertThat(scheduler.intervalForStability(10.0, 0.9, 36500)).isEqualTo(10);
        assertThat(scheduler.intervalForStability(1.0, 0.9, 36500)).isEqualTo(1);
        assertThat(scheduler.intervalForStability(100.0, 0.9, 36500)).isEqualTo(100);
    }

    @Test
    @DisplayName("Higher target retention yields shorter intervals than lower retention")
    void retentionShortensInterval() {
        int tight = scheduler.intervalForStability(50.0, 0.95, 36500);
        int loose = scheduler.intervalForStability(50.0, 0.85, 36500);
        assertThat(tight).isLessThan(loose);
    }
}
