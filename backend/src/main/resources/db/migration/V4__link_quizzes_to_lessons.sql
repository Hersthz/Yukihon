IF OBJECT_ID('quizzes', 'U') IS NOT NULL
   AND COL_LENGTH('quizzes', 'lesson_id') IS NULL
BEGIN
	ALTER TABLE quizzes
	ADD lesson_id BIGINT NULL;
END;
GO

IF OBJECT_ID('quizzes', 'U') IS NOT NULL
   AND OBJECT_ID('lessons', 'U') IS NOT NULL
   AND COL_LENGTH('quizzes', 'lesson_id') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_quizzes_lesson')
BEGIN
	ALTER TABLE quizzes
	ADD CONSTRAINT fk_quizzes_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id);
END;
GO

IF OBJECT_ID('quizzes', 'U') IS NOT NULL
   AND COL_LENGTH('quizzes', 'lesson_id') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_quizzes_lesson_id' AND object_id = OBJECT_ID('quizzes'))
BEGIN
	CREATE INDEX idx_quizzes_lesson_id ON quizzes(lesson_id);
END;
