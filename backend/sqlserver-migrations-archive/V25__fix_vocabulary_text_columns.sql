-- Fix: vocabulary.meaning (and example sentences) were created as legacy SQL Server `text`,
-- which the dictionary search uses with lower() -> error 8116 "Argument data type text is invalid
-- for argument 1 of lower function". Convert to NVARCHAR(MAX) (also better for Japanese/Vietnamese).
IF COL_LENGTH('vocabulary', 'meaning') IS NOT NULL
   AND EXISTS (SELECT 1 FROM sys.columns c JOIN sys.types t ON c.user_type_id = t.user_type_id
               WHERE c.object_id = OBJECT_ID('vocabulary') AND c.name = 'meaning' AND t.name = 'text')
BEGIN
    ALTER TABLE vocabulary ALTER COLUMN meaning NVARCHAR(MAX) NOT NULL;
END;
GO

IF EXISTS (SELECT 1 FROM sys.columns c JOIN sys.types t ON c.user_type_id = t.user_type_id
           WHERE c.object_id = OBJECT_ID('vocabulary') AND c.name = 'example_sentencejp' AND t.name = 'text')
BEGIN
    ALTER TABLE vocabulary ALTER COLUMN example_sentencejp NVARCHAR(MAX) NULL;
END;
GO

IF EXISTS (SELECT 1 FROM sys.columns c JOIN sys.types t ON c.user_type_id = t.user_type_id
           WHERE c.object_id = OBJECT_ID('vocabulary') AND c.name = 'example_sentenceen' AND t.name = 'text')
BEGIN
    ALTER TABLE vocabulary ALTER COLUMN example_sentenceen NVARCHAR(MAX) NULL;
END;
GO
