package com.hoang.basis.yukihon.system.savedword.entity;

import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.vocabulary.entity.Vocabulary;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "saved_words",
        uniqueConstraints = @UniqueConstraint(name = "uk_saved_word", columnNames = {"user_id", "vocabulary_id"}),
        indexes = {
                @Index(name = "idx_saved_user", columnList = "user_id"),
                @Index(name = "idx_saved_folder", columnList = "folder_name")
        })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavedWord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vocabulary_id", nullable = false)
    private Vocabulary vocabulary;

    @Column(length = 100)
    @Builder.Default
    private String folderName = "Default";

    @Column(columnDefinition = "NVARCHAR(500)")
    private String personalNote;

    @Builder.Default
    @Column(nullable = false)
    private boolean mastered = false;

    @Builder.Default
    @Column(nullable = false)
    private Integer reviewIntervalDays = 0;

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

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
        if (nextReviewAt == null) {
            nextReviewAt = createdAt;
        }
    }
}
