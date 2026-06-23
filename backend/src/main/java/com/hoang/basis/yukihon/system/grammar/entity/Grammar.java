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

    @Column(nullable = false, columnDefinition = "VARCHAR(100)")
    private String pattern; // e.g., "〜ている", "〜だろう"

    @Column(columnDefinition = "LONGTEXT")
    private String explanation;

    // `usage` is a reserved word in MySQL — force-quote the column identifier.
    @Column(name = "`usage`", columnDefinition = "LONGTEXT")
    private String usage;

    @Column(columnDefinition = "LONGTEXT")
    private String exampleJP;

    @Column(columnDefinition = "LONGTEXT")
    private String exampleEN;

    @Column(length = 5)
    private String jlptLevel; // N1, N2, N3, N4, N5

    @Column(columnDefinition = "LONGTEXT")
    private String relatedPatterns; // Comma-separated related patterns

    @Column(columnDefinition = "LONGTEXT")
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
