package com.hoang.basis.yukihon.system.dictionary.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** One (radical, kanji) pair from KRADFILE — a kanji is composed of several radicals. */
@Entity
@Table(
        name = "kanji_radical",
        uniqueConstraints =
                @UniqueConstraint(
                        name = "uk_kanji_radical",
                        columnNames = {"radical", "kanji"}))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KanjiRadical {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 8)
    private String radical;

    @Column(nullable = false, length = 8)
    private String kanji;
}
