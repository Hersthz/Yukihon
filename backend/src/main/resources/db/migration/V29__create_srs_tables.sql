-- Phase 1: SRS engine tables (algorithm configs, per-deck settings, per-card progress, review logs).

IF OBJECT_ID('srs_algorithm_configs', 'U') IS NULL
BEGIN
    CREATE TABLE srs_algorithm_configs (
        id BIGINT IDENTITY(1,1) NOT NULL,
        code VARCHAR(100) NOT NULL,
        name NVARCHAR(255) NOT NULL,
        algorithm_type VARCHAR(20) NOT NULL CONSTRAINT df_srscfg_type DEFAULT ('SM2'),
        config_json NVARCHAR(MAX) NULL,
        enabled BIT NOT NULL CONSTRAINT df_srscfg_enabled DEFAULT (1),
        is_active BIT NOT NULL CONSTRAINT df_srscfg_active DEFAULT (1),
        is_deleted BIT NOT NULL CONSTRAINT df_srscfg_deleted DEFAULT (0),
        version BIGINT NOT NULL CONSTRAINT df_srscfg_version DEFAULT (0),
        created_at DATETIME2(6) NOT NULL,
        updated_at DATETIME2(6) NOT NULL,
        created_by VARCHAR(255) NULL,
        updated_by VARCHAR(255) NULL,
        CONSTRAINT pk_srs_algorithm_configs PRIMARY KEY (id),
        CONSTRAINT uk_srs_config_code UNIQUE (code)
    );
END;
GO

IF OBJECT_ID('anki_srs_settings', 'U') IS NULL
BEGIN
    CREATE TABLE anki_srs_settings (
        id BIGINT IDENTITY(1,1) NOT NULL,
        user_id BIGINT NOT NULL,
        deck_id BIGINT NOT NULL,
        algorithm_config_id BIGINT NULL,
        target_retention FLOAT NULL,
        max_reviews_per_day INT NULL,
        max_items_per_day INT NULL,
        maximum_interval_days INT NULL,
        suspend_leeches BIT NOT NULL CONSTRAINT df_ankiset_leech DEFAULT (1),
        leech_threshold INT NOT NULL CONSTRAINT df_ankiset_threshold DEFAULT (8),
        is_active BIT NOT NULL CONSTRAINT df_ankiset_active DEFAULT (1),
        is_deleted BIT NOT NULL CONSTRAINT df_ankiset_deleted DEFAULT (0),
        version BIGINT NOT NULL CONSTRAINT df_ankiset_version DEFAULT (0),
        created_at DATETIME2(6) NOT NULL,
        updated_at DATETIME2(6) NOT NULL,
        created_by VARCHAR(255) NULL,
        updated_by VARCHAR(255) NULL,
        CONSTRAINT pk_anki_srs_settings PRIMARY KEY (id),
        CONSTRAINT uk_anki_setting_user_deck UNIQUE (user_id, deck_id)
    );
END;
GO

IF OBJECT_ID('anki_srs_progress', 'U') IS NULL
BEGIN
    CREATE TABLE anki_srs_progress (
        id BIGINT IDENTITY(1,1) NOT NULL,
        user_id BIGINT NOT NULL,
        deck_id BIGINT NOT NULL,
        flashcard_id BIGINT NOT NULL,
        state VARCHAR(30) NOT NULL CONSTRAINT df_ankiprog_state DEFAULT ('NEW'),
        memory_score FLOAT NOT NULL CONSTRAINT df_ankiprog_mem DEFAULT (0),
        ease_factor FLOAT NOT NULL CONSTRAINT df_ankiprog_ease DEFAULT (2.5),
        interval_days INT NOT NULL CONSTRAINT df_ankiprog_interval DEFAULT (0),
        review_count INT NOT NULL CONSTRAINT df_ankiprog_review DEFAULT (0),
        learning_step_index INT NOT NULL CONSTRAINT df_ankiprog_step DEFAULT (0),
        lapses INT NOT NULL CONSTRAINT df_ankiprog_lapses DEFAULT (0),
        last_rating VARCHAR(20) NULL,
        algorithm_type VARCHAR(20) NULL,
        difficulty FLOAT NULL,
        stability FLOAT NULL,
        retrievability FLOAT NULL,
        is_leech BIT NOT NULL CONSTRAINT df_ankiprog_leech DEFAULT (0),
        suspended BIT NOT NULL CONSTRAINT df_ankiprog_suspended DEFAULT (0),
        first_learned_at DATETIME2(6) NULL,
        last_reviewed_at DATETIME2(6) NULL,
        next_review_at DATETIME2(6) NULL,
        is_active BIT NOT NULL CONSTRAINT df_ankiprog_active DEFAULT (1),
        is_deleted BIT NOT NULL CONSTRAINT df_ankiprog_deleted DEFAULT (0),
        version BIGINT NOT NULL CONSTRAINT df_ankiprog_version DEFAULT (0),
        created_at DATETIME2(6) NOT NULL,
        updated_at DATETIME2(6) NOT NULL,
        created_by VARCHAR(255) NULL,
        updated_by VARCHAR(255) NULL,
        CONSTRAINT pk_anki_srs_progress PRIMARY KEY (id),
        CONSTRAINT uk_anki_progress UNIQUE (user_id, deck_id, flashcard_id)
    );
    CREATE INDEX idx_anki_progress_due ON anki_srs_progress (user_id, next_review_at);
    CREATE INDEX idx_anki_progress_flashcard ON anki_srs_progress (flashcard_id);
END;
GO

IF OBJECT_ID('anki_review_logs', 'U') IS NULL
BEGIN
    CREATE TABLE anki_review_logs (
        id BIGINT IDENTITY(1,1) NOT NULL,
        user_id BIGINT NOT NULL,
        progress_id BIGINT NOT NULL,
        deck_id BIGINT NOT NULL,
        flashcard_id BIGINT NOT NULL,
        rating VARCHAR(20) NOT NULL,
        score FLOAT NULL,
        time_taken_ms INT NULL,
        reviewed_at DATETIME2(6) NOT NULL,
        old_ease_factor FLOAT NULL,
        new_ease_factor FLOAT NULL,
        old_interval_days INT NULL,
        new_interval_days INT NULL,
        old_state VARCHAR(30) NULL,
        new_state VARCHAR(30) NULL,
        old_lapses INT NULL,
        new_lapses INT NULL,
        source_type VARCHAR(30) NOT NULL CONSTRAINT df_ankilog_source DEFAULT ('ANKI_REVIEW'),
        source_id BIGINT NULL,
        is_active BIT NOT NULL CONSTRAINT df_ankilog_active DEFAULT (1),
        is_deleted BIT NOT NULL CONSTRAINT df_ankilog_deleted DEFAULT (0),
        version BIGINT NOT NULL CONSTRAINT df_ankilog_version DEFAULT (0),
        created_at DATETIME2(6) NOT NULL,
        updated_at DATETIME2(6) NOT NULL,
        created_by VARCHAR(255) NULL,
        updated_by VARCHAR(255) NULL,
        CONSTRAINT pk_anki_review_logs PRIMARY KEY (id)
    );
    CREATE INDEX idx_anki_log_user ON anki_review_logs (user_id);
    CREATE INDEX idx_anki_log_progress ON anki_review_logs (progress_id);
    CREATE INDEX idx_anki_log_reviewed ON anki_review_logs (reviewed_at);
END;
GO
