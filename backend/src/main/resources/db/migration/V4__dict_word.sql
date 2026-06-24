-- JMdict word entries (self-hosted from jmdict-simplified), imported once via an admin endpoint.
-- Powers full-coverage dictionary lookup (any Japanese word), merged behind the curated `vocabulary`
-- table. English glosses (JMdict is English); Vietnamese comes from local vocabulary or on-demand
-- translation. Primary kanji/kana forms are denormalized for fast indexed lookup.
CREATE TABLE dict_word (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    jmdict_id       VARCHAR(20)  NOT NULL,
    kanji           VARCHAR(100) NULL,
    kana            VARCHAR(100) NOT NULL,
    romaji          VARCHAR(200) NULL,
    is_common       TINYINT(1)   NOT NULL DEFAULT 0,
    glosses_en      VARCHAR(2000) NOT NULL,
    part_of_speech  VARCHAR(255) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_dict_word_jmdict (jmdict_id),
    KEY idx_dict_word_kanji (kanji),
    KEY idx_dict_word_kana (kana),
    KEY idx_dict_word_romaji (romaji)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
