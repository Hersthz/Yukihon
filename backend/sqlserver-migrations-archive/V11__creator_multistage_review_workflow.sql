IF COL_LENGTH('creator_templates', 'admin_reviewed_by_user_id') IS NULL
BEGIN
    ALTER TABLE creator_templates ADD admin_reviewed_by_user_id BIGINT NULL;
END;
GO

IF COL_LENGTH('creator_templates', 'admin_review_note') IS NULL
BEGIN
    ALTER TABLE creator_templates ADD admin_review_note NVARCHAR(1000) NULL;
END;
GO

IF COL_LENGTH('creator_templates', 'admin_reviewed_at') IS NULL
BEGIN
    ALTER TABLE creator_templates ADD admin_reviewed_at DATETIME2 NULL;
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = 'fk_creator_templates_admin_reviewed_by'
)
BEGIN
    ALTER TABLE creator_templates
        ADD CONSTRAINT fk_creator_templates_admin_reviewed_by
        FOREIGN KEY (admin_reviewed_by_user_id) REFERENCES users(id);
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'idx_creator_templates_admin_reviewed_by'
      AND object_id = OBJECT_ID('creator_templates')
)
BEGIN
    CREATE INDEX idx_creator_templates_admin_reviewed_by ON creator_templates(admin_reviewed_by_user_id);
END;
GO

IF NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'CONTENT_REVIEW')
BEGIN
    INSERT INTO permissions (code, name, description, created_at, updated_at)
    VALUES (
        'CONTENT_REVIEW',
        'Review Learning Content',
        'Review and approve creator submissions before admin publishing',
        SYSUTCDATETIME(),
        SYSUTCDATETIME()
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'CONTENT_PUBLISH')
BEGIN
    INSERT INTO permissions (code, name, description, created_at, updated_at)
    VALUES (
        'CONTENT_PUBLISH',
        'Publish Learning Content',
        'Perform final publish decision for creator submissions',
        SYSUTCDATETIME(),
        SYSUTCDATETIME()
    );
END;
GO

IF EXISTS (SELECT 1 FROM permissions WHERE code = 'USER_READ_PROFILE')
AND NOT EXISTS (
    SELECT 1
    FROM role_permissions rp
    JOIN permissions p ON p.id = rp.permission_id
    WHERE rp.role = 'REVIEWER' AND p.code = 'USER_READ_PROFILE'
)
BEGIN
    INSERT INTO role_permissions (role, permission_id, created_at)
    SELECT 'REVIEWER', p.id, SYSUTCDATETIME()
    FROM permissions p
    WHERE p.code = 'USER_READ_PROFILE';
END;
GO

IF EXISTS (SELECT 1 FROM permissions WHERE code = 'USER_UPDATE_PROFILE')
AND NOT EXISTS (
    SELECT 1
    FROM role_permissions rp
    JOIN permissions p ON p.id = rp.permission_id
    WHERE rp.role = 'REVIEWER' AND p.code = 'USER_UPDATE_PROFILE'
)
BEGIN
    INSERT INTO role_permissions (role, permission_id, created_at)
    SELECT 'REVIEWER', p.id, SYSUTCDATETIME()
    FROM permissions p
    WHERE p.code = 'USER_UPDATE_PROFILE';
END;
GO

IF EXISTS (SELECT 1 FROM permissions WHERE code = 'CONTENT_READ')
AND NOT EXISTS (
    SELECT 1
    FROM role_permissions rp
    JOIN permissions p ON p.id = rp.permission_id
    WHERE rp.role = 'REVIEWER' AND p.code = 'CONTENT_READ'
)
BEGIN
    INSERT INTO role_permissions (role, permission_id, created_at)
    SELECT 'REVIEWER', p.id, SYSUTCDATETIME()
    FROM permissions p
    WHERE p.code = 'CONTENT_READ';
END;
GO

IF EXISTS (SELECT 1 FROM permissions WHERE code = 'CONTENT_REVIEW')
AND NOT EXISTS (
    SELECT 1
    FROM role_permissions rp
    JOIN permissions p ON p.id = rp.permission_id
    WHERE rp.role = 'REVIEWER' AND p.code = 'CONTENT_REVIEW'
)
BEGIN
    INSERT INTO role_permissions (role, permission_id, created_at)
    SELECT 'REVIEWER', p.id, SYSUTCDATETIME()
    FROM permissions p
    WHERE p.code = 'CONTENT_REVIEW';
END;
GO

IF EXISTS (SELECT 1 FROM permissions WHERE code = 'COMMUNITY_INTERACT')
AND NOT EXISTS (
    SELECT 1
    FROM role_permissions rp
    JOIN permissions p ON p.id = rp.permission_id
    WHERE rp.role = 'REVIEWER' AND p.code = 'COMMUNITY_INTERACT'
)
BEGIN
    INSERT INTO role_permissions (role, permission_id, created_at)
    SELECT 'REVIEWER', p.id, SYSUTCDATETIME()
    FROM permissions p
    WHERE p.code = 'COMMUNITY_INTERACT';
END;
GO

IF EXISTS (SELECT 1 FROM permissions WHERE code = 'TRANSLATION_USE')
AND NOT EXISTS (
    SELECT 1
    FROM role_permissions rp
    JOIN permissions p ON p.id = rp.permission_id
    WHERE rp.role = 'REVIEWER' AND p.code = 'TRANSLATION_USE'
)
BEGIN
    INSERT INTO role_permissions (role, permission_id, created_at)
    SELECT 'REVIEWER', p.id, SYSUTCDATETIME()
    FROM permissions p
    WHERE p.code = 'TRANSLATION_USE';
END;
GO

IF EXISTS (SELECT 1 FROM permissions WHERE code = 'CONTENT_REVIEW')
AND NOT EXISTS (
    SELECT 1
    FROM role_permissions rp
    JOIN permissions p ON p.id = rp.permission_id
    WHERE rp.role = 'ADMIN' AND p.code = 'CONTENT_REVIEW'
)
BEGIN
    INSERT INTO role_permissions (role, permission_id, created_at)
    SELECT 'ADMIN', p.id, SYSUTCDATETIME()
    FROM permissions p
    WHERE p.code = 'CONTENT_REVIEW';
END;
GO

IF EXISTS (SELECT 1 FROM permissions WHERE code = 'CONTENT_PUBLISH')
AND NOT EXISTS (
    SELECT 1
    FROM role_permissions rp
    JOIN permissions p ON p.id = rp.permission_id
    WHERE rp.role = 'ADMIN' AND p.code = 'CONTENT_PUBLISH'
)
BEGIN
    INSERT INTO role_permissions (role, permission_id, created_at)
    SELECT 'ADMIN', p.id, SYSUTCDATETIME()
    FROM permissions p
    WHERE p.code = 'CONTENT_PUBLISH';
END;
GO
