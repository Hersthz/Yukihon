package com.hoang.basis.yukihon.system.grammar.entity;

import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;

/**
 * Grammar entity for Japanese grammar rules and explanations
 */
@Entity
@Table(
        name = "grammar",
        indexes = {
            @Index(name = "idx_grammar_jlpt_level", columnList = "jlpt_level"),
            @Index(name = "idx_grammar_pattern", columnList = "pattern")
        })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Grammar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "NVARCHAR(100)")
    private String pattern; // e.g., "〜ている", "〜だろう"

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String explanation;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String usage;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String exampleJP;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String exampleEN;

    @Column(length = 5)
    private String jlptLevel; // N1, N2, N3, N4, N5

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String relatedPatterns; // Comma-separated related patterns

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String notes;

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
