package com.hoang.basis.yukihon.system.dictionary.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** A community-contributed meaning or example sentence for a dictionary headword. */
@Entity
@Table(name = "dict_contribution", indexes = @Index(name = "idx_dict_contribution_headword", columnList = "headword"))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DictContribution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String headword;

    /** MEANING | EXAMPLE */
    @Column(nullable = false, length = 20)
    private String type;

    @Column(nullable = false, length = 1000)
    private String content;

    /** Vietnamese translation for an EXAMPLE contribution (optional). */
    @Column(length = 1000)
    private String translation;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Integer upvotes;

    @Column(nullable = false)
    private Integer downvotes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (upvotes == null) {
            upvotes = 0;
        }
        if (downvotes == null) {
            downvotes = 0;
        }
    }
}
