-- Composite indexes for hot, user-scoped query paths that the entity @Index annotations
-- (already in V1) don't cover: ordered notebook/review lists, the deck-scoped study queue,
-- and the translation history list. Single-column user_id indexes exist in V1; these add the
-- second column the real queries sort/seek on.

-- My Words: default notebook list (ORDER BY created_at) + spaced-repetition due queue
CREATE INDEX idx_saved_words_user_created ON saved_words (user_id, created_at);
CREATE INDEX idx_saved_words_user_due ON saved_words (user_id, next_review_at);

-- SM-2 study queue: findByUserIdAndDeckId + findByUserIdAndDeckIdAndFlashcardId
CREATE INDEX idx_anki_progress_user_deck_card ON anki_srs_progress (user_id, deck_id, flashcard_id);

-- Translation history list (per user, ORDER BY created_at)
CREATE INDEX idx_translation_history_user_created ON translation_history (user_id, created_at);
