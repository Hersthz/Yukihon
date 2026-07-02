-- D6: community-contributed meanings/examples for dictionary words, with up/down votes.
CREATE TABLE `dict_contribution` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `headword` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` VARCHAR(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` VARCHAR(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `translation` VARCHAR(1000) COLLATE utf8mb4_unicode_ci NULL,
  `user_id` BIGINT NOT NULL,
  `upvotes` INT NOT NULL DEFAULT 0,
  `downvotes` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_dict_contribution_headword` (`headword`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `dict_contribution_vote` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `contribution_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `value` INT NOT NULL,
  `created_at` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_dict_vote` (`contribution_id`, `user_id`),
  KEY `idx_dict_vote_contribution` (`contribution_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
