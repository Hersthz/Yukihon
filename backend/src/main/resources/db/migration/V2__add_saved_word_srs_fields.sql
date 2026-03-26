ALTER TABLE saved_words
ADD review_interval_days INT NOT NULL CONSTRAINT DF_saved_words_review_interval_days DEFAULT 0;

ALTER TABLE saved_words
ADD ease_factor FLOAT NOT NULL CONSTRAINT DF_saved_words_ease_factor DEFAULT 2.5;

ALTER TABLE saved_words
ADD repetition_count INT NOT NULL CONSTRAINT DF_saved_words_repetition_count DEFAULT 0;

ALTER TABLE saved_words
ADD review_count INT NOT NULL CONSTRAINT DF_saved_words_review_count DEFAULT 0;

ALTER TABLE saved_words
ADD last_reviewed_at DATETIME2 NULL;

ALTER TABLE saved_words
ADD next_review_at DATETIME2 NULL;

UPDATE saved_words
SET next_review_at = created_at
WHERE next_review_at IS NULL;
