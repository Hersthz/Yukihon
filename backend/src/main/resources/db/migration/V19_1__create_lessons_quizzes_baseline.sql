-- Baseline tables that previously relied on Hibernate ddl-auto and never had a creating migration.
-- On environments where these tables already exist they are skipped (idempotent guards), so this
-- migration is a harmless no-op there. Runs as version 19.1 (before V20, which FKs to quizzes).
-- Column types reflect the JPA entities (MySQL TEXT/LONGTEXT mapped to SQL Server NVARCHAR(MAX)).

IF OBJECT_ID('lessons', 'U') IS NULL
BEGIN
    CREATE TABLE lessons (
        id BIGINT IDENTITY(1,1) NOT NULL,
        title NVARCHAR(200) NOT NULL,
        description NVARCHAR(MAX) NULL,
        content NVARCHAR(MAX) NULL,
        jlpt_level VARCHAR(5) NULL,
        category VARCHAR(100) NULL,
        status VARCHAR(30) NOT NULL,
        order_index INT NULL,
        audio_url NVARCHAR(MAX) NULL,
        video_url NVARCHAR(MAX) NULL,
        image_url NVARCHAR(MAX) NULL,
        related_vocabulary_ids NVARCHAR(MAX) NULL,
        related_grammar_ids NVARCHAR(MAX) NULL,
        related_quiz_ids NVARCHAR(MAX) NULL,
        created_at DATETIME2(6) NOT NULL,
        updated_at DATETIME2(6) NOT NULL,
        CONSTRAINT pk_lessons PRIMARY KEY (id)
    );
END;
GO

IF OBJECT_ID('lessons', 'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_lesson_jlpt_level' AND object_id = OBJECT_ID('lessons'))
BEGIN
    CREATE INDEX idx_lesson_jlpt_level ON lessons (jlpt_level);
END;
GO

IF OBJECT_ID('lessons', 'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_lesson_status' AND object_id = OBJECT_ID('lessons'))
BEGIN
    CREATE INDEX idx_lesson_status ON lessons (status);
END;
GO

IF OBJECT_ID('quizzes', 'U') IS NULL
BEGIN
    CREATE TABLE quizzes (
        id BIGINT IDENTITY(1,1) NOT NULL,
        title NVARCHAR(200) NOT NULL,
        description NVARCHAR(MAX) NULL,
        quiz_type VARCHAR(50) NOT NULL,
        difficulty_level VARCHAR(100) NULL,
        jlpt_level VARCHAR(5) NULL,
        lesson_id BIGINT NULL,
        question NVARCHAR(MAX) NULL,
        options NVARCHAR(MAX) NULL,
        correct_answer NVARCHAR(MAX) NULL,
        explanation NVARCHAR(MAX) NULL,
        audio_url NVARCHAR(MAX) NULL,
        image_url NVARCHAR(MAX) NULL,
        created_at DATETIME2(6) NOT NULL,
        updated_at DATETIME2(6) NOT NULL,
        CONSTRAINT pk_quizzes PRIMARY KEY (id)
    );
END;
GO

IF OBJECT_ID('quizzes', 'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_quiz_level' AND object_id = OBJECT_ID('quizzes'))
BEGIN
    CREATE INDEX idx_quiz_level ON quizzes (difficulty_level);
END;
GO

IF OBJECT_ID('quizzes', 'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_quiz_type' AND object_id = OBJECT_ID('quizzes'))
BEGIN
    CREATE INDEX idx_quiz_type ON quizzes (quiz_type);
END;
GO

IF OBJECT_ID('lesson_versions', 'U') IS NULL
BEGIN
    CREATE TABLE lesson_versions (
        id BIGINT IDENTITY(1,1) NOT NULL,
        lesson_id BIGINT NOT NULL,
        version_number INT NOT NULL,
        change_action VARCHAR(30) NOT NULL,
        title NVARCHAR(200) NOT NULL,
        description NVARCHAR(MAX) NULL,
        content NVARCHAR(MAX) NULL,
        jlpt_level VARCHAR(5) NULL,
        category VARCHAR(100) NULL,
        status VARCHAR(30) NOT NULL,
        order_index INT NULL,
        audio_url NVARCHAR(MAX) NULL,
        video_url NVARCHAR(MAX) NULL,
        image_url NVARCHAR(MAX) NULL,
        related_vocabulary_ids NVARCHAR(MAX) NULL,
        related_grammar_ids NVARCHAR(MAX) NULL,
        related_quiz_ids NVARCHAR(MAX) NULL,
        created_at DATETIME2(6) NOT NULL,
        CONSTRAINT pk_lesson_versions PRIMARY KEY (id)
    );
END;
GO

IF OBJECT_ID('lesson_versions', 'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_lesson_versions_lesson_id' AND object_id = OBJECT_ID('lesson_versions'))
BEGIN
    CREATE INDEX idx_lesson_versions_lesson_id ON lesson_versions (lesson_id);
END;
GO
