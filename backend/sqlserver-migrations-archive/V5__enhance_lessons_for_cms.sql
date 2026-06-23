IF OBJECT_ID('lessons', 'U') IS NOT NULL
   AND COL_LENGTH('lessons', 'related_vocabulary_ids') IS NULL
BEGIN
    ALTER TABLE lessons
    ADD related_vocabulary_ids NVARCHAR(500) NULL;
END;
GO

IF OBJECT_ID('lessons', 'U') IS NOT NULL
   AND COL_LENGTH('lessons', 'related_grammar_ids') IS NULL
BEGIN
    ALTER TABLE lessons
    ADD related_grammar_ids NVARCHAR(500) NULL;
END;
GO

IF OBJECT_ID('lessons', 'U') IS NOT NULL
   AND COL_LENGTH('lessons', 'related_quiz_ids') IS NULL
BEGIN
    ALTER TABLE lessons
    ADD related_quiz_ids NVARCHAR(500) NULL;
END;
GO

IF OBJECT_ID('lesson_versions', 'U') IS NULL
   AND OBJECT_ID('lessons', 'U') IS NOT NULL
BEGIN
    CREATE TABLE lesson_versions (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        lesson_id BIGINT NOT NULL,
        version_number INT NOT NULL,
        change_action NVARCHAR(30) NOT NULL,
        title NVARCHAR(200) NOT NULL,
        description NVARCHAR(MAX) NULL,
        content NVARCHAR(MAX) NULL,
        jlpt_level NVARCHAR(5) NULL,
        category NVARCHAR(100) NULL,
        status NVARCHAR(30) NOT NULL,
        order_index INT NULL,
        audio_url NVARCHAR(MAX) NULL,
        video_url NVARCHAR(MAX) NULL,
        image_url NVARCHAR(MAX) NULL,
        related_vocabulary_ids NVARCHAR(500) NULL,
        related_grammar_ids NVARCHAR(500) NULL,
        related_quiz_ids NVARCHAR(500) NULL,
        created_at DATETIME2 NOT NULL,
        CONSTRAINT fk_lesson_versions_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id)
    );
END;
GO

IF OBJECT_ID('lesson_versions', 'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_lesson_versions_lesson_id' AND object_id = OBJECT_ID('lesson_versions'))
BEGIN
    CREATE INDEX idx_lesson_versions_lesson_id ON lesson_versions(lesson_id);
END;
