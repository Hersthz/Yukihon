package com.hoang.basis.yukihon.system.kanjisrs.entity;

import com.hoang.basis.yukihon.system.user.entity.User;
import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;

@Entity
@Table(
        name = "kanji_srs_review_events",
        indexes = {
            @Index(name = "idx_kanji_srs_review_events_user_reviewed", columnList = "user_id, reviewed_at"),
            @Index(name = "idx_kanji_srs_review_events_character", columnList = "kanji_character")
        })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KanjiSrsReviewEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "kanji_character", nullable = false, length = 16, columnDefinition = "NVARCHAR(16)")
    private String character;

    @Column(nullable = false, length = 16)
    private String rating;

    @Column(nullable = false)
    private boolean successful;

    @Column(name = "interval_after_days", nullable = false)
    private Integer intervalAfterDays;

    @Column(name = "ease_after", nullable = false)
    private Double easeAfter;

    @Column(name = "reviewed_at", nullable = false)
    private Instant reviewedAt;
}
