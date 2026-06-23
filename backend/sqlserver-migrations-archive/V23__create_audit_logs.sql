-- Audit trail for @AuditEnabled auto-CRUD entities (written via EntityChangedEvent listener).
IF OBJECT_ID('audit_logs', 'U') IS NULL
BEGIN
    CREATE TABLE audit_logs (
        id BIGINT IDENTITY(1,1) NOT NULL,
        entity_type VARCHAR(100) NOT NULL,
        entity_id BIGINT NULL,
        action VARCHAR(20) NOT NULL,
        actor VARCHAR(255) NULL,
        snapshot NVARCHAR(MAX) NULL,
        created_at DATETIME2(6) NOT NULL,
        CONSTRAINT pk_audit_logs PRIMARY KEY (id)
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_audit_entity' AND object_id = OBJECT_ID('audit_logs'))
BEGIN
    CREATE INDEX idx_audit_entity ON audit_logs (entity_type, entity_id);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_audit_created' AND object_id = OBJECT_ID('audit_logs'))
BEGIN
    CREATE INDEX idx_audit_created ON audit_logs (created_at);
END;
GO
