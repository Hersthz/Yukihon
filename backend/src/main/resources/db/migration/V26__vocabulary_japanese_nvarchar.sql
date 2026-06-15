-- Fix: vocabulary.kanji/hiragana/romaji were created as non-Unicode `varchar`, so Japanese text
-- was stored as '?' (collapsing all rows to the same value -> UNIQUE violation on seed, and
-- garbled dictionary content). Convert to NVARCHAR. kanji participates in a unique constraint +
-- index, so drop those first (the unique constraint is auto-named), alter, then recreate.
DECLARE @uc NVARCHAR(128);
SELECT @uc = kc.name FROM sys.key_constraints kc
WHERE kc.parent_object_id = OBJECT_ID('vocabulary') AND kc.type = 'UQ';
IF @uc IS NOT NULL EXEC('ALTER TABLE vocabulary DROP CONSTRAINT ' + @uc);
GO

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_vocab_kanji' AND object_id = OBJECT_ID('vocabulary'))
    DROP INDEX idx_vocab_kanji ON vocabulary;
GO

ALTER TABLE vocabulary ALTER COLUMN kanji NVARCHAR(100) NOT NULL;
GO
ALTER TABLE vocabulary ALTER COLUMN hiragana NVARCHAR(100) NOT NULL;
GO
ALTER TABLE vocabulary ALTER COLUMN romaji NVARCHAR(100) NOT NULL;
GO
ALTER TABLE vocabulary ALTER COLUMN additional_notes NVARCHAR(500) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'uk_vocabulary_kanji' AND parent_object_id = OBJECT_ID('vocabulary'))
    ALTER TABLE vocabulary ADD CONSTRAINT uk_vocabulary_kanji UNIQUE (kanji);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_vocab_kanji' AND object_id = OBJECT_ID('vocabulary'))
    CREATE INDEX idx_vocab_kanji ON vocabulary (kanji);
GO
