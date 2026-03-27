ALTER TABLE quizzes
ADD lesson_id BIGINT NULL;

ALTER TABLE quizzes
ADD CONSTRAINT fk_quizzes_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id);

CREATE INDEX idx_quizzes_lesson_id ON quizzes(lesson_id);
