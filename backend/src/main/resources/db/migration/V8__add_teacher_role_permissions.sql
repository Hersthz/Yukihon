IF EXISTS (SELECT 1 FROM permissions WHERE code = 'USER_READ_PROFILE')
AND NOT EXISTS (
    SELECT 1
    FROM role_permissions rp
    JOIN permissions p ON p.id = rp.permission_id
    WHERE rp.role = 'TEACHER' AND p.code = 'USER_READ_PROFILE'
)
BEGIN
    INSERT INTO role_permissions (role, permission_id, created_at)
    SELECT 'TEACHER', p.id, SYSUTCDATETIME()
    FROM permissions p
    WHERE p.code = 'USER_READ_PROFILE';
END;

IF EXISTS (SELECT 1 FROM permissions WHERE code = 'USER_UPDATE_PROFILE')
AND NOT EXISTS (
    SELECT 1
    FROM role_permissions rp
    JOIN permissions p ON p.id = rp.permission_id
    WHERE rp.role = 'TEACHER' AND p.code = 'USER_UPDATE_PROFILE'
)
BEGIN
    INSERT INTO role_permissions (role, permission_id, created_at)
    SELECT 'TEACHER', p.id, SYSUTCDATETIME()
    FROM permissions p
    WHERE p.code = 'USER_UPDATE_PROFILE';
END;

IF EXISTS (SELECT 1 FROM permissions WHERE code = 'CONTENT_READ')
AND NOT EXISTS (
    SELECT 1
    FROM role_permissions rp
    JOIN permissions p ON p.id = rp.permission_id
    WHERE rp.role = 'TEACHER' AND p.code = 'CONTENT_READ'
)
BEGIN
    INSERT INTO role_permissions (role, permission_id, created_at)
    SELECT 'TEACHER', p.id, SYSUTCDATETIME()
    FROM permissions p
    WHERE p.code = 'CONTENT_READ';
END;

IF EXISTS (SELECT 1 FROM permissions WHERE code = 'CONTENT_MANAGE')
AND NOT EXISTS (
    SELECT 1
    FROM role_permissions rp
    JOIN permissions p ON p.id = rp.permission_id
    WHERE rp.role = 'TEACHER' AND p.code = 'CONTENT_MANAGE'
)
BEGIN
    INSERT INTO role_permissions (role, permission_id, created_at)
    SELECT 'TEACHER', p.id, SYSUTCDATETIME()
    FROM permissions p
    WHERE p.code = 'CONTENT_MANAGE';
END;

IF EXISTS (SELECT 1 FROM permissions WHERE code = 'COMMUNITY_INTERACT')
AND NOT EXISTS (
    SELECT 1
    FROM role_permissions rp
    JOIN permissions p ON p.id = rp.permission_id
    WHERE rp.role = 'TEACHER' AND p.code = 'COMMUNITY_INTERACT'
)
BEGIN
    INSERT INTO role_permissions (role, permission_id, created_at)
    SELECT 'TEACHER', p.id, SYSUTCDATETIME()
    FROM permissions p
    WHERE p.code = 'COMMUNITY_INTERACT';
END;

IF EXISTS (SELECT 1 FROM permissions WHERE code = 'TRANSLATION_USE')
AND NOT EXISTS (
    SELECT 1
    FROM role_permissions rp
    JOIN permissions p ON p.id = rp.permission_id
    WHERE rp.role = 'TEACHER' AND p.code = 'TRANSLATION_USE'
)
BEGIN
    INSERT INTO role_permissions (role, permission_id, created_at)
    SELECT 'TEACHER', p.id, SYSUTCDATETIME()
    FROM permissions p
    WHERE p.code = 'TRANSLATION_USE';
END;
