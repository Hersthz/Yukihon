package com.hoang.basis.yukihon.system.srs.service;

import com.hoang.basis.yukihon.system.srs.entity.AnkiSrsProgress;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import org.springframework.stereotype.Component;

/**
 * FSRS-5 scheduler (py-fsrs v4.1.2 weights). Models memory as Difficulty / Stability /
 * Retrievability and schedules the next review when retrievability is expected to fall to the
 * target retention. Mutates the FSRS fields on {@link AnkiSrsProgress}; never touches SM-2 decks.
 *
 * <p>Golden rule: at retention 0.9, interval ≈ round(stability).
 */
@Component
public class FsrsScheduler {

    private static final double DECAY = -0.5;
    private static final double FACTOR = Math.pow(0.9, 1.0 / DECAY) - 1.0; // ≈ 0.234568

    private static final double[] W = {
        0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192, 1.01925, 1.9395, 0.11,
        0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621
    };

    private static final Duration RELEARN_STEP = Duration.ofMinutes(10);

    /** Apply one rating to an FSRS card, updating D/S/R, interval, state and next review time. */
    public void apply(
            AnkiSrsProgress p, String rating, double targetRetention, int maxIntervalDays, LocalDateTime now) {
        int g = grade(rating);
        String prevState = p.getState() != null ? p.getState() : "NEW";
        LocalDateTime prevReviewed = p.getLastReviewedAt();
        double retention = clamp(targetRetention, 0.70, 0.98);

        if (p.getFirstLearnedAt() == null) {
            p.setFirstLearnedAt(now);
        }
        p.setReviewCount(nvl(p.getReviewCount()) + 1);

        double newStability;
        double newDifficulty;
        double r = 1.0;

        if (p.getStability() == null || p.getDifficulty() == null) {
            // First exposure — seed S0/D0 from the grade.
            newStability = Math.max(0.1, W[g - 1]);
            newDifficulty = clamp(W[4] - Math.exp(W[5] * (g - 1)) + 1.0, 1.0, 10.0);
        } else {
            double s = p.getStability();
            double d = p.getDifficulty();
            long elapsed = prevReviewed != null ? Math.max(0, ChronoUnit.DAYS.between(prevReviewed, now)) : 0;
            r = Math.pow(1.0 + FACTOR * elapsed / s, DECAY);

            if (g == 1) {
                double forget =
                        W[11] * Math.pow(d, -W[12]) * (Math.pow(s + 1.0, W[13]) - 1.0) * Math.exp((1.0 - r) * W[14]);
                double shortTerm = s / Math.exp(W[17] * W[18]);
                newStability = Math.min(forget, shortTerm);
            } else {
                double hardPenalty = g == 2 ? W[15] : 1.0;
                double easyBonus = g == 4 ? W[16] : 1.0;
                double inc = Math.exp(W[8])
                        * (11.0 - d)
                        * Math.pow(s, -W[9])
                        * (Math.exp((1.0 - r) * W[10]) - 1.0)
                        * hardPenalty
                        * easyBonus;
                newStability = s * (1.0 + inc);
            }

            double deltaD = -W[6] * (g - 3);
            double damped = d + (10.0 - d) * deltaD / 9.0;
            double d0Easy = clamp(W[4] - Math.exp(W[5] * 3.0) + 1.0, 1.0, 10.0);
            newDifficulty = clamp(W[7] * d0Easy + (1.0 - W[7]) * damped, 1.0, 10.0);
        }

        newStability = Math.max(0.1, newStability);
        p.setStability(newStability);
        p.setDifficulty(newDifficulty);
        p.setRetrievability(r);
        p.setAlgorithmType("FSRS");

        int interval = (int) Math.round((newStability / FACTOR) * (Math.pow(retention, 1.0 / DECAY) - 1.0));
        interval = (int) clamp(interval, 1, maxIntervalDays);
        p.setIntervalDays(interval);

        if (g == 1) {
            if ("REVIEW".equals(prevState)) {
                p.setLapses(nvl(p.getLapses()) + 1);
            }
            p.setState("RELEARNING");
            p.setNextReviewAt(now.plus(RELEARN_STEP));
        } else {
            p.setState("REVIEW");
            p.setNextReviewAt(now.plusDays(interval));
        }

        p.setLastRating(normalizeRating(rating));
        p.setLastReviewedAt(now);
        // Display 0–100 score derived from stability (monotonic, saturating).
        p.setMemoryScore(Math.round(1000.0 * (newStability / (newStability + 15.0))) / 10.0);
    }

    /** Interval (days) a given stability maps to at the target retention — used for reschedule. */
    public int intervalForStability(double stability, double targetRetention, int maxIntervalDays) {
        double retention = clamp(targetRetention, 0.70, 0.98);
        int interval = (int) Math.round((stability / FACTOR) * (Math.pow(retention, 1.0 / DECAY) - 1.0));
        return (int) clamp(interval, 1, maxIntervalDays);
    }

    private int grade(String rating) {
        return switch (normalizeRating(rating)) {
            case "AGAIN" -> 1;
            case "HARD" -> 2;
            case "EASY" -> 4;
            default -> 3; // GOOD
        };
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

    private int nvl(Integer v) {
        return v != null ? v : 0;
    }

    private double clamp(double v, double min, double max) {
        return Math.max(min, Math.min(max, v));
    }
}
