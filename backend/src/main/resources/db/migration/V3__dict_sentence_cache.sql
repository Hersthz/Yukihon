-- Example-sentence cache fed on-demand from the Tatoeba API (cache-on-demand): the first lookup of
-- a word fetches JP sentences + their Vietnamese/English translations and stores them here, so
-- subsequent lookups are served locally with no external call. A later bulk import can pre-warm it.
CREATE TABLE dict_sentence (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    query_word      VARCHAR(100) NOT NULL,
    tatoeba_jpn_id  BIGINT       NOT NULL,
    jpn_text        VARCHAR(1000) NOT NULL,
    vie_text        VARCHAR(1000) NULL,
    eng_text        VARCHAR(1000) NULL,
    created_at      DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_dict_sentence_word_sentence (query_word, tatoeba_jpn_id),
    KEY idx_dict_sentence_word (query_word)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
