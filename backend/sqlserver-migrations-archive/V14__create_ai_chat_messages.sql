CREATE TABLE ai_chat_messages (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL,
    text NVARCHAR(MAX) NOT NULL,
    mode VARCHAR(30) NOT NULL,
    model VARCHAR(100) NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT fk_ai_chat_messages_user FOREIGN KEY (user_id) REFERENCES users(id)
);
GO

CREATE INDEX idx_ai_chat_user_id ON ai_chat_messages(user_id);
GO

CREATE INDEX idx_ai_chat_created_at ON ai_chat_messages(created_at);
GO
