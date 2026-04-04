CREATE TABLE ai_chat_conversations (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(120) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT fk_ai_chat_conversations_user FOREIGN KEY (user_id) REFERENCES users(id)
);
GO

CREATE INDEX idx_ai_chat_conversations_user_id ON ai_chat_conversations(user_id);
GO

CREATE INDEX idx_ai_chat_conversations_updated_at ON ai_chat_conversations(updated_at);
GO

ALTER TABLE ai_chat_messages ADD conversation_id BIGINT NULL;
GO

INSERT INTO ai_chat_conversations (user_id, title, created_at, updated_at)
SELECT
    imported.user_id,
    'Imported chat',
    imported.first_created_at,
    imported.last_created_at
FROM (
    SELECT
        user_id,
        MIN(created_at) AS first_created_at,
        MAX(created_at) AS last_created_at
    FROM ai_chat_messages
    GROUP BY user_id
) imported;
GO

UPDATE messages
SET conversation_id = conversations.id
FROM ai_chat_messages messages
INNER JOIN ai_chat_conversations conversations
    ON conversations.user_id = messages.user_id
    AND conversations.title = 'Imported chat'
WHERE messages.conversation_id IS NULL;
GO

ALTER TABLE ai_chat_messages ALTER COLUMN conversation_id BIGINT NOT NULL;
GO

ALTER TABLE ai_chat_messages
ADD CONSTRAINT fk_ai_chat_messages_conversation
FOREIGN KEY (conversation_id) REFERENCES ai_chat_conversations(id) ON DELETE CASCADE;
GO

CREATE INDEX idx_ai_chat_messages_conversation_id ON ai_chat_messages(conversation_id);
GO
