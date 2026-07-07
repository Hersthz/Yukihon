-- Quizlet-style study sessions (non-SRS): each run of Learn/Match records a session with a running
-- tally, plus a per-answer log. Fully separate from anki_srs_progress — study here never affects SRS.
CREATE TABLE `quizlet_study_sessions` (
  `is_active` bit(1) NOT NULL,
  `is_deleted` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) NOT NULL,
  `version` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `deck_id` bigint NOT NULL,
  `mode` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_answered` int NOT NULL,
  `correct_count` int NOT NULL,
  `wrong_count` int NOT NULL,
  `started_at` datetime(6) NOT NULL,
  `completed_at` datetime(6) DEFAULT NULL,
  `duration_seconds` int DEFAULT NULL,
  `created_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_quizlet_session_deck` (`user_id`, `deck_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `quizlet_study_logs` (
  `is_active` bit(1) NOT NULL,
  `is_deleted` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) NOT NULL,
  `version` bigint NOT NULL,
  `session_id` bigint NOT NULL,
  `flashcard_id` bigint NOT NULL,
  `correct` bit(1) NOT NULL,
  `answer` longtext COLLATE utf8mb4_unicode_ci,
  `answered_at` datetime(6) NOT NULL,
  `created_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_quizlet_log_session` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
