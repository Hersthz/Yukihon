CREATE TABLE blog_posts (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    title          VARCHAR(300) NOT NULL,
    slug           VARCHAR(300) NOT NULL,
    excerpt        TEXT,
    content        LONGTEXT,
    cover_image_url TEXT,
    tags           TEXT,
    author_name    VARCHAR(200),
    status         VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    published_at   DATETIME(6),
    created_at     DATETIME(6) NOT NULL,
    updated_at     DATETIME(6) NOT NULL,
    CONSTRAINT uq_blog_post_slug UNIQUE (slug),
    INDEX idx_blog_post_status (status),
    INDEX idx_blog_post_published_at (published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
