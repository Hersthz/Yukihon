package com.hoang.basis.yukihon.system.dictionary.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** A cached example sentence (Japanese + VN/EN translation) for a search word, sourced from Tatoeba. */
@Entity
@Table(
        name = "dict_sentence",
        uniqueConstraints =
                @UniqueConstraint(
                        name = "uk_dict_sentence_word_sentence",
                        columnNames = {"query_word", "tatoeba_jpn_id"}),
        indexes = @Index(name = "idx_dict_sentence_word", columnList = "query_word"))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DictSentence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "query_word", nullable = false, length = 100)
    private String queryWord;

    @Column(name = "tatoeba_jpn_id", nullable = false)
    private Long tatoebaJpnId;

    @Column(name = "jpn_text", nullable = false, length = 1000)
    private String jpnText;

    @Column(name = "vie_text", length = 1000)
    private String vieText;

    @Column(name = "eng_text", length = 1000)
    private String engText;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
