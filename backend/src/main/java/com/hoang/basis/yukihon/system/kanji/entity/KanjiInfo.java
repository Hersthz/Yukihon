package com.hoang.basis.yukihon.system.kanji.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Cached kanji metadata from kanjiapi.dev (KANJIDIC). Readings stored comma-joined. */
@Entity
@Table(
        name = "kanji_info",
        uniqueConstraints = @UniqueConstraint(name = "uk_kanji_info_character", columnNames = "character_"))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KanjiInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "character_", nullable = false, length = 8)
    private String character;

    @Column(length = 500)
    private String meaning;

    @Column(name = "on_readings", length = 255)
    private String onReadings;

    @Column(name = "kun_readings", length = 255)
    private String kunReadings;

    @Column(name = "stroke_count")
    private Integer strokeCount;

    @Column(name = "jlpt_level", length = 5)
    private String jlptLevel;

    /** Newspaper frequency rank (kanjiapi.dev freq_mainichi_shinbun); lower = more common. */
    @Column(name = "frequency")
    private Integer frequency;

    /** Raw KanjiVG SVG with per-stroke paths, for stroke-order animation. */
    @Column(name = "stroke_svg", columnDefinition = "LONGTEXT")
    private String strokeSvg;

    /** Comma-joined component/radical characters parsed from KanjiVG (e.g. "吉,糸"). */
    @Column(name = "components", length = 500)
    private String components;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
