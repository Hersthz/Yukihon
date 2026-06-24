-- Cached kanji metadata fetched on demand from kanjiapi.dev (KANJIDIC) — readings, meanings,
-- stroke count, JLPT — so the kanji library works for any character, not just the curated catalog.
CREATE TABLE kanji_info (
    id            BIGINT      NOT NULL AUTO_INCREMENT,
    character_    VARCHAR(8)  NOT NULL,
    meaning       VARCHAR(500) NULL,
    on_readings   VARCHAR(255) NULL,
    kun_readings  VARCHAR(255) NULL,
    stroke_count  INT         NULL,
    jlpt_level    VARCHAR(5)  NULL,
    created_at    DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_kanji_info_character (character_)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
