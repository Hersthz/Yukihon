-- In-app notifications per user.
IF OBJECT_ID('notifications', 'U') IS NULL
BEGIN
    CREATE TABLE notifications (
        id BIGINT IDENTITY(1,1) NOT NULL,
        user_id BIGINT NOT NULL,
        type VARCHAR(50) NOT NULL,
        title NVARCHAR(200) NOT NULL,
        message NVARCHAR(MAX) NULL,
        link NVARCHAR(500) NULL,
        is_read BIT NOT NULL CONSTRAINT df_notifications_is_read DEFAULT (0),
        created_at DATETIME2(6) NOT NULL,
        CONSTRAINT pk_notifications PRIMARY KEY (id),
        CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id)
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_notification_user' AND object_id = OBJECT_ID('notifications'))
BEGIN
    CREATE INDEX idx_notification_user ON notifications (user_id);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_notification_user_read' AND object_id = OBJECT_ID('notifications'))
BEGIN
    CREATE INDEX idx_notification_user_read ON notifications (user_id, is_read);
END;
GO
