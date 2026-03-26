ALTER TABLE community_posts
ADD title NVARCHAR(200) NULL;

ALTER TABLE community_posts
ADD tags NVARCHAR(500) NULL;

CREATE TABLE post_bookmarks (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at DATETIME2 NOT NULL,
    CONSTRAINT uk_post_bookmark UNIQUE (post_id, user_id),
    CONSTRAINT fk_post_bookmark_post FOREIGN KEY (post_id) REFERENCES community_posts(id),
    CONSTRAINT fk_post_bookmark_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_bookmark_post ON post_bookmarks(post_id);
CREATE INDEX idx_bookmark_user ON post_bookmarks(user_id);
