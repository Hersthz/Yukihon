IF OBJECT_ID('community_posts', 'U') IS NOT NULL
   AND COL_LENGTH('community_posts', 'title') IS NULL
BEGIN
    ALTER TABLE community_posts
    ADD title NVARCHAR(200) NULL;
END;
GO

IF OBJECT_ID('community_posts', 'U') IS NOT NULL
   AND COL_LENGTH('community_posts', 'tags') IS NULL
BEGIN
    ALTER TABLE community_posts
    ADD tags NVARCHAR(500) NULL;
END;
GO

IF OBJECT_ID('post_bookmarks', 'U') IS NULL
   AND OBJECT_ID('community_posts', 'U') IS NOT NULL
   AND OBJECT_ID('users', 'U') IS NOT NULL
BEGIN
    CREATE TABLE post_bookmarks (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        post_id BIGINT NOT NULL,
        user_id BIGINT NOT NULL,
        created_at DATETIME2 NOT NULL,
        CONSTRAINT uk_post_bookmark UNIQUE (post_id, user_id),
        CONSTRAINT fk_post_bookmark_post FOREIGN KEY (post_id) REFERENCES community_posts(id),
        CONSTRAINT fk_post_bookmark_user FOREIGN KEY (user_id) REFERENCES users(id)
    );
END;
GO

IF OBJECT_ID('post_bookmarks', 'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_bookmark_post' AND object_id = OBJECT_ID('post_bookmarks'))
BEGIN
    CREATE INDEX idx_bookmark_post ON post_bookmarks(post_id);
END;
GO

IF OBJECT_ID('post_bookmarks', 'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_bookmark_user' AND object_id = OBJECT_ID('post_bookmarks'))
BEGIN
    CREATE INDEX idx_bookmark_user ON post_bookmarks(user_id);
END;
