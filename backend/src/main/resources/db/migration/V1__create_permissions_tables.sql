IF OBJECT_ID('permissions', 'U') IS NULL
BEGIN
    CREATE TABLE permissions (
        id BIGINT IDENTITY(1,1) NOT NULL,
        code VARCHAR(100) NOT NULL,
        name VARCHAR(200) NOT NULL,
        description TEXT NULL,
        created_at DATETIME2(6) NOT NULL,
        updated_at DATETIME2(6) NOT NULL,
        CONSTRAINT pk_permissions PRIMARY KEY (id),
        CONSTRAINT uk_permission_code UNIQUE (code)
    );
END;
GO

IF OBJECT_ID('role_permissions', 'U') IS NULL
BEGIN
    CREATE TABLE role_permissions (
        id BIGINT IDENTITY(1,1) NOT NULL,
        role VARCHAR(50) NOT NULL,
        permission_id BIGINT NOT NULL,
        created_at DATETIME2(6) NOT NULL,
        CONSTRAINT pk_role_permissions PRIMARY KEY (id),
        CONSTRAINT uk_role_permission UNIQUE (role, permission_id),
        CONSTRAINT fk_role_permission_permission FOREIGN KEY (permission_id) REFERENCES permissions (id)
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_role_permission_role' AND object_id = OBJECT_ID('role_permissions'))
BEGIN
    CREATE INDEX idx_role_permission_role ON role_permissions (role);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_role_permission_permission' AND object_id = OBJECT_ID('role_permissions'))
BEGIN
    CREATE INDEX idx_role_permission_permission ON role_permissions (permission_id);
END;
GO
