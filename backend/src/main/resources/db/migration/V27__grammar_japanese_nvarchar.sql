-- Fix: grammar.pattern (varchar) and example/explanation/usage/notes (legacy `text`) stored Japanese
-- as '?'. Convert to NVARCHAR. pattern has a non-unique index that must be dropped first.
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_grammar_pattern' AND object_id = OBJECT_ID('grammar'))
    DROP INDEX idx_grammar_pattern ON grammar;
GO

ALTER TABLE grammar ALTER COLUMN pattern NVARCHAR(100) NOT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_grammar_pattern' AND object_id = OBJECT_ID('grammar'))
    CREATE INDEX idx_grammar_pattern ON grammar (pattern);
GO

IF EXISTS (SELECT 1 FROM sys.columns c JOIN sys.types t ON c.user_type_id = t.user_type_id
           WHERE c.object_id = OBJECT_ID('grammar') AND c.name = 'explanation' AND t.name = 'text')
    ALTER TABLE grammar ALTER COLUMN explanation NVARCHAR(MAX) NULL;
GO
IF EXISTS (SELECT 1 FROM sys.columns c JOIN sys.types t ON c.user_type_id = t.user_type_id
           WHERE c.object_id = OBJECT_ID('grammar') AND c.name = 'usage' AND t.name = 'text')
    ALTER TABLE grammar ALTER COLUMN usage NVARCHAR(MAX) NULL;
GO
IF EXISTS (SELECT 1 FROM sys.columns c JOIN sys.types t ON c.user_type_id = t.user_type_id
           WHERE c.object_id = OBJECT_ID('grammar') AND c.name = 'examplejp' AND t.name = 'text')
    ALTER TABLE grammar ALTER COLUMN examplejp NVARCHAR(MAX) NULL;
GO
IF EXISTS (SELECT 1 FROM sys.columns c JOIN sys.types t ON c.user_type_id = t.user_type_id
           WHERE c.object_id = OBJECT_ID('grammar') AND c.name = 'exampleen' AND t.name = 'text')
    ALTER TABLE grammar ALTER COLUMN exampleen NVARCHAR(MAX) NULL;
GO
IF EXISTS (SELECT 1 FROM sys.columns c JOIN sys.types t ON c.user_type_id = t.user_type_id
           WHERE c.object_id = OBJECT_ID('grammar') AND c.name = 'related_patterns' AND t.name = 'text')
    ALTER TABLE grammar ALTER COLUMN related_patterns NVARCHAR(MAX) NULL;
GO
IF EXISTS (SELECT 1 FROM sys.columns c JOIN sys.types t ON c.user_type_id = t.user_type_id
           WHERE c.object_id = OBJECT_ID('grammar') AND c.name = 'notes' AND t.name = 'text')
    ALTER TABLE grammar ALTER COLUMN notes NVARCHAR(MAX) NULL;
GO
