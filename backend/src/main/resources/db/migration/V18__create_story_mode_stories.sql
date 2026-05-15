IF OBJECT_ID('story_mode_stories', 'U') IS NULL
BEGIN
    CREATE TABLE story_mode_stories (
        id BIGINT IDENTITY(1,1) NOT NULL,
        story_key VARCHAR(120) NOT NULL,
        title NVARCHAR(200) NOT NULL,
        subtitle NVARCHAR(300) NULL,
        description NVARCHAR(MAX) NULL,
        jlpt_level VARCHAR(20) NOT NULL,
        estimated_minutes INT NOT NULL,
        tone NVARCHAR(80) NULL,
        cover_label NVARCHAR(100) NULL,
        entry_segment_id VARCHAR(120) NOT NULL,
        published BIT NOT NULL CONSTRAINT DF_story_mode_published DEFAULT 0,
        content_json NVARCHAR(MAX) NOT NULL,
        created_at DATETIME2(6) NOT NULL,
        updated_at DATETIME2(6) NOT NULL,
        CONSTRAINT pk_story_mode_stories PRIMARY KEY (id),
        CONSTRAINT uk_story_mode_story_key UNIQUE (story_key)
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_story_mode_published' AND object_id = OBJECT_ID('story_mode_stories'))
BEGIN
    CREATE INDEX idx_story_mode_published ON story_mode_stories (published);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_story_mode_jlpt' AND object_id = OBJECT_ID('story_mode_stories'))
BEGIN
    CREATE INDEX idx_story_mode_jlpt ON story_mode_stories (jlpt_level);
END;
GO
