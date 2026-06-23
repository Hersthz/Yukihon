IF OBJECT_ID('kanji_srs_review_events', 'U') IS NULL
BEGIN
    CREATE TABLE kanji_srs_review_events (
        id BIGINT IDENTITY(1,1) NOT NULL,
        user_id BIGINT NOT NULL,
        kanji_character NVARCHAR(16) NOT NULL,
        rating NVARCHAR(16) NOT NULL,
        successful BIT NOT NULL,
        interval_after_days INT NOT NULL,
        ease_after FLOAT NOT NULL,
        reviewed_at DATETIME2(6) NOT NULL,
        CONSTRAINT pk_kanji_srs_review_events PRIMARY KEY (id),
        CONSTRAINT fk_kanji_srs_review_events_user FOREIGN KEY (user_id) REFERENCES users (id)
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_kanji_srs_review_events_user_reviewed' AND object_id = OBJECT_ID('kanji_srs_review_events'))
BEGIN
    CREATE INDEX idx_kanji_srs_review_events_user_reviewed ON kanji_srs_review_events (user_id, reviewed_at);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_kanji_srs_review_events_character' AND object_id = OBJECT_ID('kanji_srs_review_events'))
BEGIN
    CREATE INDEX idx_kanji_srs_review_events_character ON kanji_srs_review_events (kanji_character);
END;
GO
