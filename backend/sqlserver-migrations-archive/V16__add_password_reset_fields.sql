IF COL_LENGTH('users', 'password_reset_token_hash') IS NULL
BEGIN
    ALTER TABLE users ADD password_reset_token_hash VARCHAR(128) NULL;
END;
GO

IF COL_LENGTH('users', 'password_reset_expires_at') IS NULL
BEGIN
    ALTER TABLE users ADD password_reset_expires_at DATETIME2(6) NULL;
END;
GO

IF COL_LENGTH('users', 'password_reset_requested_at') IS NULL
BEGIN
    ALTER TABLE users ADD password_reset_requested_at DATETIME2(6) NULL;
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_users_password_reset_token_hash' AND object_id = OBJECT_ID('users'))
BEGIN
    CREATE INDEX idx_users_password_reset_token_hash ON users (password_reset_token_hash);
END;
GO
