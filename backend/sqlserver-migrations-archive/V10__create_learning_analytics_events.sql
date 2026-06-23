CREATE TABLE learning_analytics_events (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    session_id NVARCHAR(120) NULL,
    event_type NVARCHAR(60) NOT NULL,
    content_type NVARCHAR(30) NOT NULL,
    content_id BIGINT NOT NULL,
    jlpt_level NVARCHAR(5) NULL,
    duration_seconds INT NULL,
    score INT NULL,
    metadata_json NVARCHAR(MAX) NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT df_learning_analytics_events_created_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT fk_learning_analytics_events_user
        FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_learning_analytics_events_event_created
    ON learning_analytics_events (event_type, created_at DESC);

CREATE INDEX idx_learning_analytics_events_content_created
    ON learning_analytics_events (content_type, content_id, created_at DESC);

CREATE INDEX idx_learning_analytics_events_user_created
    ON learning_analytics_events (user_id, created_at DESC);
