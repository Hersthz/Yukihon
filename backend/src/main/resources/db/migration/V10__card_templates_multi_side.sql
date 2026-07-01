-- P4: card templates + multi-side (bidirectional) study.
-- A flashcard's template decides how many study cards it produces:
--   FORWARD          -> one card (front -> back)
--   FORWARD_REVERSE  -> two cards (front -> back AND back -> front)
-- Each generated card gets its own SRS progress, distinguished by `side`.

ALTER TABLE `flashcards`
  ADD COLUMN `template` VARCHAR(20) NOT NULL DEFAULT 'FORWARD';

ALTER TABLE `anki_srs_progress`
  ADD COLUMN `side` VARCHAR(10) NOT NULL DEFAULT 'FORWARD';

-- Widen the per-card uniqueness to include the side so forward/reverse progress coexist.
ALTER TABLE `anki_srs_progress` DROP INDEX `uk_anki_progress`;
ALTER TABLE `anki_srs_progress`
  ADD CONSTRAINT `uk_anki_progress` UNIQUE (`user_id`, `deck_id`, `flashcard_id`, `side`);
