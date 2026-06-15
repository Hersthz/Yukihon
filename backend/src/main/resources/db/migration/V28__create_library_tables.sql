-- Phase 1: unified flashcard library (folders, decks, flashcards, deck_items, tags, favorite_decks).
-- Columns mirror the JPA entities (all extend BaseEntity -> audit + soft-delete + version).

IF OBJECT_ID('folders', 'U') IS NULL
BEGIN
    CREATE TABLE folders (
        id BIGINT IDENTITY(1,1) NOT NULL,
        user_id BIGINT NOT NULL,
        name NVARCHAR(150) NOT NULL,
        description NVARCHAR(MAX) NULL,
        is_active BIT NOT NULL CONSTRAINT df_folders_active DEFAULT (1),
        is_deleted BIT NOT NULL CONSTRAINT df_folders_deleted DEFAULT (0),
        version BIGINT NOT NULL CONSTRAINT df_folders_version DEFAULT (0),
        created_at DATETIME2(6) NOT NULL,
        updated_at DATETIME2(6) NOT NULL,
        created_by VARCHAR(255) NULL,
        updated_by VARCHAR(255) NULL,
        CONSTRAINT pk_folders PRIMARY KEY (id)
    );
    CREATE INDEX idx_folders_user ON folders (user_id);
END;
GO

IF OBJECT_ID('decks', 'U') IS NULL
BEGIN
    CREATE TABLE decks (
        id BIGINT IDENTITY(1,1) NOT NULL,
        user_id BIGINT NOT NULL,
        folder_id BIGINT NULL,
        original_deck_id BIGINT NULL,
        title NVARCHAR(200) NOT NULL,
        description NVARCHAR(MAX) NULL,
        visibility VARCHAR(20) NOT NULL CONSTRAINT df_decks_visibility DEFAULT ('PRIVATE'),
        cover_image_url NVARCHAR(MAX) NULL,
        source_language VARCHAR(10) NULL,
        target_language VARCHAR(10) NULL,
        total_cards INT NOT NULL CONSTRAINT df_decks_total DEFAULT (0),
        clone_count INT NOT NULL CONSTRAINT df_decks_clone DEFAULT (0),
        favorite_count INT NOT NULL CONSTRAINT df_decks_fav DEFAULT (0),
        is_active BIT NOT NULL CONSTRAINT df_decks_active DEFAULT (1),
        is_deleted BIT NOT NULL CONSTRAINT df_decks_deleted DEFAULT (0),
        version BIGINT NOT NULL CONSTRAINT df_decks_version DEFAULT (0),
        created_at DATETIME2(6) NOT NULL,
        updated_at DATETIME2(6) NOT NULL,
        created_by VARCHAR(255) NULL,
        updated_by VARCHAR(255) NULL,
        CONSTRAINT pk_decks PRIMARY KEY (id)
    );
    CREATE INDEX idx_decks_user ON decks (user_id);
    CREATE INDEX idx_decks_visibility ON decks (visibility);
END;
GO

IF OBJECT_ID('flashcards', 'U') IS NULL
BEGIN
    CREATE TABLE flashcards (
        id BIGINT IDENTITY(1,1) NOT NULL,
        card_type VARCHAR(20) NOT NULL CONSTRAINT df_flashcards_type DEFAULT ('BASIC'),
        item_type VARCHAR(30) NULL,
        item_id BIGINT NULL,
        front NVARCHAR(MAX) NOT NULL,
        back NVARCHAR(MAX) NOT NULL,
        hint NVARCHAR(MAX) NULL,
        explanation NVARCHAR(MAX) NULL,
        image_url NVARCHAR(MAX) NULL,
        audio_url NVARCHAR(MAX) NULL,
        is_active BIT NOT NULL CONSTRAINT df_flashcards_active DEFAULT (1),
        is_deleted BIT NOT NULL CONSTRAINT df_flashcards_deleted DEFAULT (0),
        version BIGINT NOT NULL CONSTRAINT df_flashcards_version DEFAULT (0),
        created_at DATETIME2(6) NOT NULL,
        updated_at DATETIME2(6) NOT NULL,
        created_by VARCHAR(255) NULL,
        updated_by VARCHAR(255) NULL,
        CONSTRAINT pk_flashcards PRIMARY KEY (id)
    );
    CREATE INDEX idx_flashcards_item ON flashcards (item_type, item_id);
    CREATE INDEX idx_flashcards_card_type ON flashcards (card_type);
END;
GO

IF OBJECT_ID('deck_items', 'U') IS NULL
BEGIN
    CREATE TABLE deck_items (
        id BIGINT IDENTITY(1,1) NOT NULL,
        deck_id BIGINT NOT NULL,
        flashcard_id BIGINT NOT NULL,
        order_index INT NOT NULL CONSTRAINT df_deck_items_order DEFAULT (0),
        is_active BIT NOT NULL CONSTRAINT df_deck_items_active DEFAULT (1),
        is_deleted BIT NOT NULL CONSTRAINT df_deck_items_deleted DEFAULT (0),
        version BIGINT NOT NULL CONSTRAINT df_deck_items_version DEFAULT (0),
        created_at DATETIME2(6) NOT NULL,
        updated_at DATETIME2(6) NOT NULL,
        created_by VARCHAR(255) NULL,
        updated_by VARCHAR(255) NULL,
        CONSTRAINT pk_deck_items PRIMARY KEY (id),
        CONSTRAINT uk_deck_item UNIQUE (deck_id, flashcard_id)
    );
    CREATE INDEX idx_deck_items_deck ON deck_items (deck_id);
    CREATE INDEX idx_deck_items_flashcard ON deck_items (flashcard_id);
END;
GO

IF OBJECT_ID('tags', 'U') IS NULL
BEGIN
    CREATE TABLE tags (
        id BIGINT IDENTITY(1,1) NOT NULL,
        user_id BIGINT NULL,
        name NVARCHAR(100) NOT NULL,
        color VARCHAR(30) NULL,
        is_active BIT NOT NULL CONSTRAINT df_tags_active DEFAULT (1),
        is_deleted BIT NOT NULL CONSTRAINT df_tags_deleted DEFAULT (0),
        version BIGINT NOT NULL CONSTRAINT df_tags_version DEFAULT (0),
        created_at DATETIME2(6) NOT NULL,
        updated_at DATETIME2(6) NOT NULL,
        created_by VARCHAR(255) NULL,
        updated_by VARCHAR(255) NULL,
        CONSTRAINT pk_tags PRIMARY KEY (id)
    );
    CREATE INDEX idx_tags_user ON tags (user_id);
    CREATE INDEX idx_tags_name ON tags (name);
END;
GO

IF OBJECT_ID('favorite_decks', 'U') IS NULL
BEGIN
    CREATE TABLE favorite_decks (
        id BIGINT IDENTITY(1,1) NOT NULL,
        user_id BIGINT NOT NULL,
        deck_id BIGINT NOT NULL,
        is_active BIT NOT NULL CONSTRAINT df_fav_active DEFAULT (1),
        is_deleted BIT NOT NULL CONSTRAINT df_fav_deleted DEFAULT (0),
        version BIGINT NOT NULL CONSTRAINT df_fav_version DEFAULT (0),
        created_at DATETIME2(6) NOT NULL,
        updated_at DATETIME2(6) NOT NULL,
        created_by VARCHAR(255) NULL,
        updated_by VARCHAR(255) NULL,
        CONSTRAINT pk_favorite_decks PRIMARY KEY (id),
        CONSTRAINT uk_favorite_deck UNIQUE (user_id, deck_id)
    );
    CREATE INDEX idx_favorite_decks_user ON favorite_decks (user_id);
END;
GO
