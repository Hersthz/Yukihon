IF OBJECT_ID('quiz_attempts', 'U') IS NULL
BEGIN
    CREATE TABLE quiz_attempts (
        id BIGINT IDENTITY(1,1) NOT NULL,
        user_id BIGINT NOT NULL,
        quiz_id BIGINT NOT NULL,
        submitted_answer NVARCHAR(MAX) NOT NULL,
        correct BIT NOT NULL,
        score INT NOT NULL,
        mistake_pattern VARCHAR(40) NULL,
        attempted_at DATETIME2(6) NOT NULL,
        CONSTRAINT pk_quiz_attempts PRIMARY KEY (id),
        CONSTRAINT fk_quiz_attempts_user FOREIGN KEY (user_id) REFERENCES users (id),
        CONSTRAINT fk_quiz_attempts_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes (id)
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_quiz_attempts_user_attempted' AND object_id = OBJECT_ID('quiz_attempts'))
BEGIN
    CREATE INDEX idx_quiz_attempts_user_attempted ON quiz_attempts (user_id, attempted_at);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_quiz_attempts_user_quiz' AND object_id = OBJECT_ID('quiz_attempts'))
BEGIN
    CREATE INDEX idx_quiz_attempts_user_quiz ON quiz_attempts (user_id, quiz_id);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_quiz_attempts_pattern' AND object_id = OBJECT_ID('quiz_attempts'))
BEGIN
    CREATE INDEX idx_quiz_attempts_pattern ON quiz_attempts (mistake_pattern);
END;
GO
