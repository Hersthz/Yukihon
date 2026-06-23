-- Performance indexes for hot, user-scoped query paths.
--
-- These tables are queried constantly per logged-in user (My Words notebook + review queue,
-- the community feed, lesson/quiz progress, translation history, the SM-2 study queue) but their
-- index coverage lived only in JPA @Index/@Table annotations, which Hibernate never materializes
-- under ddl-auto: none. This migration creates the composite indexes the real queries need.
--
-- Every statement is guarded twice: the table must exist (tolerates the known Flyway baseline gap)
-- and the index must not already exist (idempotent if a legacy ddl-auto run created it). Safe re-run.

-- saved_words: default notebook list (findByUserId... OrderByCreatedAtDesc) + folder/mastered filters
IF OBJECT_ID('saved_words', 'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_saved_words_user_created'
                   AND object_id = OBJECT_ID('saved_words'))
BEGIN
    CREATE INDEX idx_saved_words_user_created ON saved_words(user_id, created_at);
END;
GO

-- saved_words: spaced-repetition due queue (findByUserIdAndNextReviewAtLessThanEqualOrderByNextReviewAt)
IF OBJECT_ID('saved_words', 'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_saved_words_user_due'
                   AND object_id = OBJECT_ID('saved_words'))
BEGIN
    CREATE INDEX idx_saved_words_user_due ON saved_words(user_id, next_review_at);
END;
GO

-- anki_srs_progress: study-queue load (findByUserIdAndDeckId) + per-card lookup
-- (findByUserIdAndDeckIdAndFlashcardId). Existing indexes cover (user_id, next_review_at) and
-- (flashcard_id) but not the deck-scoped access this composite serves as a seek.
IF OBJECT_ID('anki_srs_progress', 'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_anki_progress_user_deck_card'
                   AND object_id = OBJECT_ID('anki_srs_progress'))
BEGIN
    CREATE INDEX idx_anki_progress_user_deck_card
        ON anki_srs_progress(user_id, deck_id, flashcard_id);
END;
GO

-- user_progress: findByUserId / findByUserIdAndStatus (dashboards, lesson list completion)
IF OBJECT_ID('user_progress', 'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_user_progress_user'
                   AND object_id = OBJECT_ID('user_progress'))
BEGIN
    CREATE INDEX idx_user_progress_user ON user_progress(user_id);
END;
GO

-- community_posts: feed ordered by recency (paginated) + a user's own posts
IF OBJECT_ID('community_posts', 'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_community_posts_created'
                   AND object_id = OBJECT_ID('community_posts'))
BEGIN
    CREATE INDEX idx_community_posts_created ON community_posts(created_at DESC);
END;
GO

IF OBJECT_ID('community_posts', 'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_community_posts_user'
                   AND object_id = OBJECT_ID('community_posts'))
BEGIN
    CREATE INDEX idx_community_posts_user ON community_posts(user_id);
END;
GO

-- translation_history: per-user history list ordered by recency
IF OBJECT_ID('translation_history', 'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_translation_history_user_created'
                   AND object_id = OBJECT_ID('translation_history'))
BEGIN
    CREATE INDEX idx_translation_history_user_created ON translation_history(user_id, created_at);
END;
GO
