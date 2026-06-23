IF OBJECT_ID('quiz_sessions', 'U') IS NULL
BEGIN
    CREATE TABLE quiz_sessions (
        id BIGINT IDENTITY(1,1) NOT NULL,
        user_id BIGINT NOT NULL,
        mode VARCHAR(40) NOT NULL,
        total_questions INT NOT NULL,
        correct_count INT NOT NULL,
        accuracy_rate DECIMAL(5,2) NOT NULL,
        weakest_pattern VARCHAR(40) NULL,
        started_at DATETIME2(6) NOT NULL,
        completed_at DATETIME2(6) NOT NULL,
        CONSTRAINT pk_quiz_sessions PRIMARY KEY (id),
        CONSTRAINT fk_quiz_sessions_user FOREIGN KEY (user_id) REFERENCES users (id)
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_quiz_sessions_user_completed' AND object_id = OBJECT_ID('quiz_sessions'))
BEGIN
    CREATE INDEX idx_quiz_sessions_user_completed ON quiz_sessions (user_id, completed_at);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_quiz_sessions_mode' AND object_id = OBJECT_ID('quiz_sessions'))
BEGIN
    CREATE INDEX idx_quiz_sessions_mode ON quiz_sessions (mode);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_quiz_sessions_weakest_pattern' AND object_id = OBJECT_ID('quiz_sessions'))
BEGIN
    CREATE INDEX idx_quiz_sessions_weakest_pattern ON quiz_sessions (weakest_pattern);
END;
GO
