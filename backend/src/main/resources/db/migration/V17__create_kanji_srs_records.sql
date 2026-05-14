IF OBJECT_ID('kanji_srs_records', 'U') IS NULL
BEGIN
    CREATE TABLE kanji_srs_records (
        id BIGINT IDENTITY(1,1) NOT NULL,
        user_id BIGINT NOT NULL,
        kanji_character NVARCHAR(16) NOT NULL,
        interval_days INT NOT NULL CONSTRAINT DF_kanji_srs_interval_days DEFAULT 0,
        ease_factor FLOAT NOT NULL CONSTRAINT DF_kanji_srs_ease_factor DEFAULT 2.5,
        repetition_count INT NOT NULL CONSTRAINT DF_kanji_srs_repetition_count DEFAULT 0,
        review_count INT NOT NULL CONSTRAINT DF_kanji_srs_review_count DEFAULT 0,
        last_reviewed_at DATETIME2(6) NULL,
        next_review_at DATETIME2(6) NOT NULL,
        created_at DATETIME2(6) NOT NULL,
        updated_at DATETIME2(6) NOT NULL,
        CONSTRAINT pk_kanji_srs_records PRIMARY KEY (id),
        CONSTRAINT uk_kanji_srs_user_character UNIQUE (user_id, kanji_character),
        CONSTRAINT fk_kanji_srs_user FOREIGN KEY (user_id) REFERENCES users (id)
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_kanji_srs_user' AND object_id = OBJECT_ID('kanji_srs_records'))
BEGIN
    CREATE INDEX idx_kanji_srs_user ON kanji_srs_records (user_id);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_kanji_srs_next_review' AND object_id = OBJECT_ID('kanji_srs_records'))
BEGIN
    CREATE INDEX idx_kanji_srs_next_review ON kanji_srs_records (next_review_at);
END;
GO
