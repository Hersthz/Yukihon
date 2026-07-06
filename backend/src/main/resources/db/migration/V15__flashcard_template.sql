-- FlashcardTemplate (GENGO-style): HTML front/back templates with {{field}} placeholders + CSS,
-- resolved per deck (deck.template_id) or falling back to the system default by card type.
CREATE TABLE `flashcard_templates` (
  `is_active` bit(1) NOT NULL,
  `is_deleted` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) NOT NULL,
  `version` bigint NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `deck_id` bigint DEFAULT NULL,
  `card_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `front_template` longtext COLLATE utf8mb4_unicode_ci,
  `back_template` longtext COLLATE utf8mb4_unicode_ci,
  `styling` longtext COLLATE utf8mb4_unicode_ci,
  `builder_config_json` longtext COLLATE utf8mb4_unicode_ci,
  `is_system` bit(1) NOT NULL,
  `is_default` bit(1) NOT NULL,
  `visibility` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_flashcard_templates_owner` (`user_id`),
  KEY `idx_flashcard_templates_default` (`is_default`, `card_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `decks` ADD COLUMN `template_id` bigint DEFAULT NULL;

-- Seed a system default BASIC template (idempotent).
INSERT INTO `flashcard_templates`
  (`is_active`, `is_deleted`, `created_at`, `updated_at`, `version`, `card_type`, `name`,
   `description`, `front_template`, `back_template`, `styling`, `is_system`, `is_default`, `visibility`)
SELECT 1, 0, NOW(6), NOW(6), 0, 'BASIC', 'Mặc định',
  'Mẫu thẻ mặc định của hệ thống',
  '<div class="yk-front"><div class="yk-term">{{front}}</div><div class="yk-reading">{{reading}}</div></div>',
  '<div class="yk-back"><div class="yk-term">{{front}}</div><div class="yk-reading">{{reading}}</div><hr class="yk-sep"/><div class="yk-meaning">{{meaning}}</div><div class="yk-yomi">{{onyomi}} {{kunyomi}}</div><div class="yk-example">{{example}}</div><div class="yk-example-tr">{{exampleTranslation}}</div><div class="yk-note">{{note}}</div></div>',
  '.yk-front,.yk-back{text-align:center}.yk-term{font-size:2.4rem;font-weight:700;color:#0f172a}.yk-reading{margin-top:.35rem;color:#0284c7;font-size:1rem}.yk-sep{margin:1rem auto;border:none;border-top:1px solid #e2e8f0;max-width:200px}.yk-meaning{font-size:1.35rem;font-weight:600;color:#0284c7}.yk-yomi{margin-top:.4rem;color:#e11d48;font-size:.95rem}.yk-example{margin-top:.6rem;color:#0f172a}.yk-example-tr{color:#64748b;font-size:.9rem}.yk-note{margin-top:.5rem;color:#7c3aed;font-size:.9rem}.yk-back div:empty,.yk-front div:empty{display:none}',
  1, 1, 'PUBLIC'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `flashcard_templates` WHERE `is_system` = 1 AND `is_default` = 1 AND `card_type` = 'BASIC'
);
