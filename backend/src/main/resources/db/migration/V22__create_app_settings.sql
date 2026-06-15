-- Auto-CRUD framework proof entity (Phase 0). Backing table for AppSetting / @AutoCrud.
-- Column layout mirrors BaseEntity (audit + soft-delete + optimistic locking).
IF OBJECT_ID('app_settings', 'U') IS NULL
BEGIN
    CREATE TABLE app_settings (
        id BIGINT IDENTITY(1,1) NOT NULL,
        setting_key VARCHAR(150) NOT NULL,
        setting_value NVARCHAR(MAX) NULL,
        category VARCHAR(100) NULL,
        description NVARCHAR(500) NULL,
        is_active BIT NOT NULL CONSTRAINT df_app_settings_is_active DEFAULT (1),
        is_deleted BIT NOT NULL CONSTRAINT df_app_settings_is_deleted DEFAULT (0),
        version BIGINT NOT NULL CONSTRAINT df_app_settings_version DEFAULT (0),
        created_at DATETIME2(6) NOT NULL,
        updated_at DATETIME2(6) NOT NULL,
        created_by VARCHAR(255) NULL,
        updated_by VARCHAR(255) NULL,
        CONSTRAINT pk_app_settings PRIMARY KEY (id),
        CONSTRAINT uk_app_setting_key UNIQUE (setting_key)
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_app_settings_category' AND object_id = OBJECT_ID('app_settings'))
BEGIN
    CREATE INDEX idx_app_settings_category ON app_settings (category);
END;
GO
