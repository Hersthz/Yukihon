IF OBJECT_ID('creator_template_audit_events', 'U') IS NULL
BEGIN
    CREATE TABLE creator_template_audit_events (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        template_id BIGINT NOT NULL,
        actor_user_id BIGINT NULL,
        stage NVARCHAR(40) NOT NULL,
        action NVARCHAR(60) NOT NULL,
        decision NVARCHAR(30) NULL,
        note NVARCHAR(1000) NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = 'fk_creator_template_audit_events_template'
)
BEGIN
    ALTER TABLE creator_template_audit_events
        ADD CONSTRAINT fk_creator_template_audit_events_template
        FOREIGN KEY (template_id) REFERENCES creator_templates(id) ON DELETE CASCADE;
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = 'fk_creator_template_audit_events_actor'
)
BEGIN
    ALTER TABLE creator_template_audit_events
        ADD CONSTRAINT fk_creator_template_audit_events_actor
        FOREIGN KEY (actor_user_id) REFERENCES users(id);
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'idx_creator_template_audit_template_created'
      AND object_id = OBJECT_ID('creator_template_audit_events')
)
BEGIN
    CREATE INDEX idx_creator_template_audit_template_created
        ON creator_template_audit_events(template_id, created_at);
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'idx_creator_template_audit_actor_created'
      AND object_id = OBJECT_ID('creator_template_audit_events')
)
BEGIN
    CREATE INDEX idx_creator_template_audit_actor_created
        ON creator_template_audit_events(actor_user_id, created_at);
END;
GO

INSERT INTO creator_template_audit_events (template_id, actor_user_id, stage, action, decision, note, created_at)
SELECT
    ct.id,
    ct.created_by_user_id,
    N'AUTHORING',
    N'CREATED',
    NULL,
    N'Initial template creation',
    COALESCE(ct.created_at, SYSUTCDATETIME())
FROM creator_templates ct
WHERE NOT EXISTS (
    SELECT 1
    FROM creator_template_audit_events e
    WHERE e.template_id = ct.id
      AND e.action = 'CREATED'
);
GO

INSERT INTO creator_template_audit_events (template_id, actor_user_id, stage, action, decision, note, created_at)
SELECT
    ct.id,
    ct.reviewed_by_user_id,
    N'REVIEWER_REVIEW',
    N'REVIEW_DECISION',
    CASE
        WHEN ct.admin_reviewed_at IS NOT NULL THEN N'APPROVED'
        WHEN ct.status = 'REJECTED' THEN N'REJECTED'
        ELSE N'APPROVED'
    END,
    ct.review_note,
    ct.reviewed_at
FROM creator_templates ct
WHERE ct.reviewed_at IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM creator_template_audit_events e
    WHERE e.template_id = ct.id
      AND e.action = 'REVIEW_DECISION'
      AND e.stage = 'REVIEWER_REVIEW'
);
GO

INSERT INTO creator_template_audit_events (template_id, actor_user_id, stage, action, decision, note, created_at)
SELECT
    ct.id,
    ct.admin_reviewed_by_user_id,
    N'ADMIN_APPROVAL',
    N'ADMIN_DECISION',
    CASE WHEN ct.status = 'PUBLISHED' THEN N'PUBLISHED' ELSE N'REJECTED' END,
    ct.admin_review_note,
    ct.admin_reviewed_at
FROM creator_templates ct
WHERE ct.admin_reviewed_at IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM creator_template_audit_events e
    WHERE e.template_id = ct.id
      AND e.action = 'ADMIN_DECISION'
      AND e.stage = 'ADMIN_APPROVAL'
);
GO