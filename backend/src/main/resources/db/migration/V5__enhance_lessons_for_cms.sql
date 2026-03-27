ALTER TABLE lessons
ADD related_vocabulary_ids NVARCHAR(500) NULL;

ALTER TABLE lessons
ADD related_grammar_ids NVARCHAR(500) NULL;

ALTER TABLE lessons
ADD related_quiz_ids NVARCHAR(500) NULL;

CREATE TABLE lesson_versions (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    lesson_id BIGINT NOT NULL,
    version_number INT NOT NULL,
    change_action NVARCHAR(30) NOT NULL,
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX) NULL,
    content NVARCHAR(MAX) NULL,
    jlpt_level NVARCHAR(5) NULL,
    category NVARCHAR(100) NULL,
    status NVARCHAR(30) NOT NULL,
    order_index INT NULL,
    audio_url NVARCHAR(MAX) NULL,
    video_url NVARCHAR(MAX) NULL,
    image_url NVARCHAR(MAX) NULL,
    related_vocabulary_ids NVARCHAR(500) NULL,
    related_grammar_ids NVARCHAR(500) NULL,
    related_quiz_ids NVARCHAR(500) NULL,
    created_at DATETIME2 NOT NULL,
    CONSTRAINT fk_lesson_versions_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);

CREATE INDEX idx_lesson_versions_lesson_id ON lesson_versions(lesson_id);
