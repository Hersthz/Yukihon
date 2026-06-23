package com.hoang.basis.yukihon.system.kanjisrs.entity;

import com.hoang.basis.yukihon.system.user.entity.User;
import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;

@Entity
@Table(
        name = "kanji_srs_records",
        uniqueConstraints =
                @UniqueConstraint(
                        name = "uk_kanji_srs_user_character",
                        columnNames = {"user_id", "kanji_character"}),
        indexes = {
            @Index(name = "idx_kanji_srs_user", columnList = "user_id"),
            @Index(name = "idx_kanji_srs_next_review", columnList = "next_review_at")
        })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KanjiSrsRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "kanji_character", nullable = false, length = 16, columnDefinition = "VARCHAR(16)")
    private String character;

    @Builder.Default
    @Column(name = "interval_days", nullable = false)
    private Integer intervalDays = 0;

    @Builder.Default
    @Column(nullable = false)
    private Double easeFactor = 2.5;

    @Builder.Default
    @Column(nullable = false)
    private Integer repetitionCount = 0;

    @Builder.Default
    @Column(nullable = false)
    private Integer reviewCount = 0;

    @Column
    private Instant lastReviewedAt;

    @Column
    private Instant nextReviewAt;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        if (nextReviewAt == null) {
            nextReviewAt = now;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
