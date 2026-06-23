CREATE TABLE creator_templates (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(200) NOT NULL,
    summary NVARCHAR(500) NULL,
    content_type NVARCHAR(30) NOT NULL,
    status NVARCHAR(30) NOT NULL,
    jlpt_level NVARCHAR(5) NOT NULL,
    tags NVARCHAR(500) NULL,
    estimated_minutes INT NOT NULL,
    builder_json NVARCHAR(MAX) NOT NULL,
    created_by_user_id BIGINT NOT NULL,
    reviewed_by_user_id BIGINT NULL,
    review_note NVARCHAR(1000) NULL,
    usage_count INT NOT NULL CONSTRAINT df_creator_templates_usage_count DEFAULT 0,
    completion_count INT NOT NULL CONSTRAINT df_creator_templates_completion_count DEFAULT 0,
    average_score DECIMAL(5,2) NOT NULL CONSTRAINT df_creator_templates_average_score DEFAULT 0,
    reviewed_at DATETIME2 NULL,
    last_published_at DATETIME2 NULL,
    created_at DATETIME2 NOT NULL,
    updated_at DATETIME2 NOT NULL,
    CONSTRAINT fk_creator_templates_created_by FOREIGN KEY (created_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_creator_templates_reviewed_by FOREIGN KEY (reviewed_by_user_id) REFERENCES users(id)
);

CREATE INDEX idx_creator_templates_status ON creator_templates(status);
CREATE INDEX idx_creator_templates_type ON creator_templates(content_type);
CREATE INDEX idx_creator_templates_creator ON creator_templates(created_by_user_id);
CREATE INDEX idx_creator_templates_updated ON creator_templates(updated_at DESC);
