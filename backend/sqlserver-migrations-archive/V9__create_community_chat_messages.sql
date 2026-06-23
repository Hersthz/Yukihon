CREATE TABLE community_chat_messages (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    room_id VARCHAR(40) NOT NULL,
    user_id BIGINT NOT NULL,
    content NVARCHAR(1000) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT fk_community_chat_messages_user
        FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_chat_room_created
    ON community_chat_messages (room_id, created_at DESC);

CREATE INDEX idx_chat_user_created
    ON community_chat_messages (user_id, created_at DESC);
