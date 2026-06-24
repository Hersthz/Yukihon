package com.hoang.basis.yukihon.system.dictionary.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** A JMdict word entry (primary forms denormalized for lookup). English glosses. */
@Entity
@Table(
        name = "dict_word",
        uniqueConstraints = @UniqueConstraint(name = "uk_dict_word_jmdict", columnNames = "jmdict_id"),
        indexes = {
            @Index(name = "idx_dict_word_kanji", columnList = "kanji"),
            @Index(name = "idx_dict_word_kana", columnList = "kana"),
            @Index(name = "idx_dict_word_romaji", columnList = "romaji")
        })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DictWord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "jmdict_id", nullable = false, length = 20)
    private String jmdictId;

    @Column(length = 100)
    private String kanji;

    @Column(nullable = false, length = 100)
    private String kana;

    @Column(length = 200)
    private String romaji;

    @Column(name = "is_common", nullable = false)
    private boolean common;

    @Column(name = "glosses_en", nullable = false, length = 2000)
    private String glossesEn;

    /** Cached Vietnamese meaning (translated on demand from the English glosses). */
    @Column(name = "vie_meaning", length = 2000)
    private String vieMeaning;

    @Column(name = "part_of_speech", length = 255)
    private String partOfSpeech;
}
