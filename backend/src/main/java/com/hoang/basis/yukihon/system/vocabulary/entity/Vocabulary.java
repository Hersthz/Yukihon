package com.hoang.basis.yukihon.system.vocabulary.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Vocabulary entity for Japanese language learning
 */
@Entity
@Table(name = "vocabulary",
        indexes = {
                @Index(name = "idx_vocab_jlpt_level", columnList = "jlpt_level"),
                @Index(name = "idx_vocab_kanji", columnList = "kanji")
        })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Vocabulary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, columnDefinition = "NVARCHAR(100)")
    private String kanji;

    @Column(nullable = false, columnDefinition = "NVARCHAR(100)")
    private String hiragana;

    @Column(nullable = false, columnDefinition = "NVARCHAR(100)")
    private String romaji;

    @Column(nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String meaning;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String exampleSentenceJP;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String exampleSentenceEN;

    @Column(length = 20)
    private String wordType; // noun, verb, adjective, etc.

    @Column(length = 5)
    private String jlptLevel; // N1, N2, N3, N4, N5

    @Column(columnDefinition = "NVARCHAR(500)")
    private String additionalNotes;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
