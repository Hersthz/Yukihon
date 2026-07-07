-- Deck view counter (bumped when a non-owner opens a deck) + per-card tags (comma-separated,
-- populated by the add-card form and by the TAGS import column).
ALTER TABLE `decks` ADD COLUMN `view_count` int NOT NULL DEFAULT 0;
ALTER TABLE `flashcards` ADD COLUMN `tags` longtext COLLATE utf8mb4_unicode_ci;
