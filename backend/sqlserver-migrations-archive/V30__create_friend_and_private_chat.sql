-- Friend system (user_connections) + 1-1 private chat (private_messages).
-- These tables had entities but no creating migration, so the feature was non-functional
-- on any clean DB (ddl-auto: none). content is NVARCHAR(MAX) for Japanese/Vietnamese.

IF OBJECT_ID('user_connections', 'U') IS NULL
BEGIN
    CREATE TABLE user_connections (
        id BIGINT IDENTITY(1,1) NOT NULL,
        requester_id BIGINT NOT NULL,
        receiver_id BIGINT NOT NULL,
        connection_type VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        created_at DATETIME2(6) NOT NULL,
        updated_at DATETIME2(6) NOT NULL,
        CONSTRAINT pk_user_connections PRIMARY KEY (id),
        CONSTRAINT uk_user_connection UNIQUE (requester_id, receiver_id, connection_type),
        CONSTRAINT fk_user_connection_requester FOREIGN KEY (requester_id) REFERENCES users (id),
        CONSTRAINT fk_user_connection_receiver FOREIGN KEY (receiver_id) REFERENCES users (id)
    );
    CREATE INDEX idx_user_connections_receiver ON user_connections (receiver_id, connection_type, status);
    CREATE INDEX idx_user_connections_requester ON user_connections (requester_id, connection_type, status);
END;
GO

IF OBJECT_ID('private_messages', 'U') IS NULL
BEGIN
    CREATE TABLE private_messages (
        id BIGINT IDENTITY(1,1) NOT NULL,
        sender_id BIGINT NOT NULL,
        receiver_id BIGINT NOT NULL,
        content NVARCHAR(MAX) NOT NULL,
        is_read BIT NOT NULL CONSTRAINT df_private_messages_read DEFAULT (0),
        created_at DATETIME2(6) NOT NULL,
        CONSTRAINT pk_private_messages PRIMARY KEY (id),
        CONSTRAINT fk_private_message_sender FOREIGN KEY (sender_id) REFERENCES users (id),
        CONSTRAINT fk_private_message_receiver FOREIGN KEY (receiver_id) REFERENCES users (id)
    );
    CREATE INDEX idx_private_messages_pair ON private_messages (sender_id, receiver_id, created_at);
    CREATE INDEX idx_private_messages_pair_rev ON private_messages (receiver_id, sender_id, created_at);
END;
GO
