-- Cached Vietnamese meaning for a JMdict word, filled on demand by translating the English glosses.
-- Once present, dictionary search returns the Vietnamese meaning instead of English.
ALTER TABLE dict_word ADD COLUMN vie_meaning VARCHAR(2000) NULL;
