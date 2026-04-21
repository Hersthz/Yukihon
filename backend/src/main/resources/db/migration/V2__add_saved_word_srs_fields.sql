IF COL_LENGTH('saved_words', 'review_interval_days') IS NULL
BEGIN
	ALTER TABLE saved_words
	ADD review_interval_days INT NOT NULL CONSTRAINT DF_saved_words_review_interval_days DEFAULT 0;
END;
GO

IF COL_LENGTH('saved_words', 'ease_factor') IS NULL
BEGIN
	ALTER TABLE saved_words
	ADD ease_factor FLOAT NOT NULL CONSTRAINT DF_saved_words_ease_factor DEFAULT 2.5;
END;
GO

IF COL_LENGTH('saved_words', 'repetition_count') IS NULL
BEGIN
	ALTER TABLE saved_words
	ADD repetition_count INT NOT NULL CONSTRAINT DF_saved_words_repetition_count DEFAULT 0;
END;
GO

IF COL_LENGTH('saved_words', 'review_count') IS NULL
BEGIN
	ALTER TABLE saved_words
	ADD review_count INT NOT NULL CONSTRAINT DF_saved_words_review_count DEFAULT 0;
END;
GO

IF COL_LENGTH('saved_words', 'last_reviewed_at') IS NULL
BEGIN
	ALTER TABLE saved_words
	ADD last_reviewed_at DATETIME2 NULL;
END;
GO

IF COL_LENGTH('saved_words', 'next_review_at') IS NULL
BEGIN
	ALTER TABLE saved_words
	ADD next_review_at DATETIME2 NULL;
END;
GO

IF COL_LENGTH('saved_words', 'next_review_at') IS NOT NULL
   AND COL_LENGTH('saved_words', 'created_at') IS NOT NULL
BEGIN
	UPDATE saved_words
	SET next_review_at = created_at
	WHERE next_review_at IS NULL;
END;
