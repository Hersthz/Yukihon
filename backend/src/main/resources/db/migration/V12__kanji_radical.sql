-- D5b: radical → kanji index (from KRADFILE) for the radical picker.
CREATE TABLE `kanji_radical` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `radical` VARCHAR(8) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kanji` VARCHAR(8) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_kanji_radical` (`radical`, `kanji`),
  KEY `idx_kanji_radical_radical` (`radical`),
  KEY `idx_kanji_radical_kanji` (`kanji`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
