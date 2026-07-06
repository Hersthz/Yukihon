-- Rich flashcard model (GENGO-style): a card has FRONT / BACK / HINT sides, each holding
-- ordered content blocks (TEXT / IMAGE / AUDIO / VIDEO / CLOZE) with a field label.
CREATE TABLE `flashcard_sides` (
  `is_active` bit(1) NOT NULL,
  `is_deleted` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) NOT NULL,
  `version` bigint NOT NULL,
  `flashcard_id` bigint NOT NULL,
  `side` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_index` int NOT NULL,
  `created_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_flashcard_side` (`flashcard_id`, `side`),
  KEY `idx_flashcard_sides_flashcard` (`flashcard_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `flashcard_side_contents` (
  `is_active` bit(1) NOT NULL,
  `is_deleted` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) NOT NULL,
  `version` bigint NOT NULL,
  `side_id` bigint NOT NULL,
  `label` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_value` longtext COLLATE utf8mb4_unicode_ci,
  `order_index` int NOT NULL,
  `metadata` longtext COLLATE utf8mb4_unicode_ci,
  `created_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_flashcard_side_contents_side` (`side_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
