-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: yukihon
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ai_chat_conversations`
--

DROP TABLE IF EXISTS `ai_chat_conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_chat_conversations` (
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL,
  `title` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ai_chat_conversations_user_id` (`user_id`),
  KEY `idx_ai_chat_conversations_updated_at` (`updated_at`),
  CONSTRAINT `FK9gtpu2vkp5wlipipa09q4url3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ai_chat_messages`
--

DROP TABLE IF EXISTS `ai_chat_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_chat_messages` (
  `conversation_id` bigint NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mode` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `text` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ai_chat_user_id` (`user_id`),
  KEY `idx_ai_chat_created_at` (`created_at`),
  KEY `FK71028lsovvjp75i6wybk26g52` (`conversation_id`),
  CONSTRAINT `FK71028lsovvjp75i6wybk26g52` FOREIGN KEY (`conversation_id`) REFERENCES `ai_chat_conversations` (`id`),
  CONSTRAINT `FKomymgkwjebej7rs8ne14ct5wq` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `anki_review_logs`
--

DROP TABLE IF EXISTS `anki_review_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `anki_review_logs` (
  `is_active` bit(1) NOT NULL,
  `is_deleted` bit(1) NOT NULL,
  `new_ease_factor` double DEFAULT NULL,
  `new_interval_days` int DEFAULT NULL,
  `new_lapses` int DEFAULT NULL,
  `old_ease_factor` double DEFAULT NULL,
  `old_interval_days` int DEFAULT NULL,
  `old_lapses` int DEFAULT NULL,
  `score` double DEFAULT NULL,
  `time_taken_ms` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `deck_id` bigint NOT NULL,
  `flashcard_id` bigint NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `progress_id` bigint NOT NULL,
  `reviewed_at` datetime(6) NOT NULL,
  `source_id` bigint DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL,
  `version` bigint NOT NULL,
  `rating` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `new_state` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `old_state` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_anki_log_user` (`user_id`),
  KEY `idx_anki_log_progress` (`progress_id`),
  KEY `idx_anki_log_reviewed` (`reviewed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `anki_srs_progress`
--

DROP TABLE IF EXISTS `anki_srs_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `anki_srs_progress` (
  `difficulty` double DEFAULT NULL,
  `ease_factor` double NOT NULL,
  `interval_days` int NOT NULL,
  `is_active` bit(1) NOT NULL,
  `is_deleted` bit(1) NOT NULL,
  `is_leech` bit(1) NOT NULL,
  `lapses` int NOT NULL,
  `learning_step_index` int NOT NULL,
  `memory_score` double NOT NULL,
  `retrievability` double DEFAULT NULL,
  `review_count` int NOT NULL,
  `stability` double DEFAULT NULL,
  `suspended` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `deck_id` bigint NOT NULL,
  `first_learned_at` datetime(6) DEFAULT NULL,
  `flashcard_id` bigint NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `last_reviewed_at` datetime(6) DEFAULT NULL,
  `next_review_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL,
  `version` bigint NOT NULL,
  `algorithm_type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_rating` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_anki_progress` (`user_id`,`deck_id`,`flashcard_id`),
  KEY `idx_anki_progress_due` (`user_id`,`next_review_at`),
  KEY `idx_anki_progress_flashcard` (`flashcard_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `anki_srs_settings`
--

DROP TABLE IF EXISTS `anki_srs_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `anki_srs_settings` (
  `is_active` bit(1) NOT NULL,
  `is_deleted` bit(1) NOT NULL,
  `leech_threshold` int NOT NULL,
  `max_items_per_day` int DEFAULT NULL,
  `max_reviews_per_day` int DEFAULT NULL,
  `maximum_interval_days` int DEFAULT NULL,
  `suspend_leeches` bit(1) NOT NULL,
  `target_retention` double DEFAULT NULL,
  `algorithm_config_id` bigint DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `deck_id` bigint NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL,
  `version` bigint NOT NULL,
  `created_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_anki_setting_user_deck` (`user_id`,`deck_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_settings`
--

DROP TABLE IF EXISTS `app_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_settings` (
  `is_active` bit(1) NOT NULL,
  `is_deleted` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) NOT NULL,
  `version` bigint NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `setting_key` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `setting_value` longtext COLLATE utf8mb4_unicode_ci,
  `updated_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_app_setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `created_at` datetime(6) NOT NULL,
  `entity_id` bigint DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `actor` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `snapshot` longtext COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `idx_audit_entity` (`entity_type`,`entity_id`),
  KEY `idx_audit_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `community_chat_messages`
--

DROP TABLE IF EXISTS `community_chat_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `community_chat_messages` (
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `room_id` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_chat_room_created` (`room_id`,`created_at`),
  KEY `idx_chat_user_created` (`user_id`,`created_at`),
  CONSTRAINT `FK45tiesw2vkw3k7qjr9uhxttf9` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `community_posts`
--

DROP TABLE IF EXISTS `community_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `community_posts` (
  `comment_count` int NOT NULL,
  `like_count` int NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL,
  `jlpt_level` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tags` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_post_user` (`user_id`),
  KEY `idx_post_created` (`created_at`),
  CONSTRAINT `FK44o0kkmkldhul00k2lm08bqje` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `creator_template_audit_events`
--

DROP TABLE IF EXISTS `creator_template_audit_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `creator_template_audit_events` (
  `actor_user_id` bigint DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `template_id` bigint DEFAULT NULL,
  `decision` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `note` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` enum('ADMIN_DECISION','CREATED','REVIEW_DECISION','SUBMITTED_FOR_REVIEW','UPDATED_DRAFT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `stage` enum('ADMIN_APPROVAL','AUTHORING','REVIEWER_REVIEW','REVIEW_SUBMISSION') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_creator_template_audit_template_created` (`template_id`,`created_at`),
  KEY `idx_creator_template_audit_actor_created` (`actor_user_id`,`created_at`),
  CONSTRAINT `FK1qimwf1rd66ktoxabkknb2yot` FOREIGN KEY (`template_id`) REFERENCES `creator_templates` (`id`),
  CONSTRAINT `FK38fhkjww5axxwky837u7e6v4g` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `creator_templates`
--

DROP TABLE IF EXISTS `creator_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `creator_templates` (
  `average_score` decimal(5,2) NOT NULL,
  `completion_count` int NOT NULL,
  `estimated_minutes` int NOT NULL,
  `usage_count` int NOT NULL,
  `jlpt_level` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `admin_reviewed_at` datetime(6) DEFAULT NULL,
  `admin_reviewed_by_user_id` bigint DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `created_by_user_id` bigint DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `last_published_at` datetime(6) DEFAULT NULL,
  `reviewed_at` datetime(6) DEFAULT NULL,
  `reviewed_by_user_id` bigint DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `summary` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tags` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `admin_review_note` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `review_note` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `builder_json` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_type` enum('MINI_LESSON','QUIZ','STORY_BRANCH') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('APPROVED','DRAFT','PENDING_REVIEW','PUBLISHED','REJECTED') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_creator_templates_status` (`status`),
  KEY `idx_creator_templates_type` (`content_type`),
  KEY `idx_creator_templates_creator` (`created_by_user_id`),
  KEY `FKl94coefuv4gdeflsowmlr72l0` (`admin_reviewed_by_user_id`),
  KEY `FKkjndrxp3yrn8f8a4unnswmjss` (`reviewed_by_user_id`),
  CONSTRAINT `FKinnkuhewgrqcdlng9xignip6w` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKkjndrxp3yrn8f8a4unnswmjss` FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKl94coefuv4gdeflsowmlr72l0` FOREIGN KEY (`admin_reviewed_by_user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `deck_items`
--

DROP TABLE IF EXISTS `deck_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deck_items` (
  `is_active` bit(1) NOT NULL,
  `is_deleted` bit(1) NOT NULL,
  `order_index` int NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `deck_id` bigint NOT NULL,
  `flashcard_id` bigint NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) NOT NULL,
  `version` bigint NOT NULL,
  `created_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_deck_item` (`deck_id`,`flashcard_id`),
  KEY `idx_deck_items_deck` (`deck_id`),
  KEY `idx_deck_items_flashcard` (`flashcard_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `decks`
--

DROP TABLE IF EXISTS `decks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `decks` (
  `clone_count` int NOT NULL,
  `favorite_count` int NOT NULL,
  `is_active` bit(1) NOT NULL,
  `is_deleted` bit(1) NOT NULL,
  `total_cards` int NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `folder_id` bigint DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `original_deck_id` bigint DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL,
  `version` bigint NOT NULL,
  `source_language` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `target_language` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `visibility` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cover_image_url` longtext COLLATE utf8mb4_unicode_ci,
  `created_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_decks_user` (`user_id`),
  KEY `idx_decks_visibility` (`visibility`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `favorite_decks`
--

DROP TABLE IF EXISTS `favorite_decks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorite_decks` (
  `is_active` bit(1) NOT NULL,
  `is_deleted` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `deck_id` bigint NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL,
  `version` bigint NOT NULL,
  `created_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_favorite_deck` (`user_id`,`deck_id`),
  KEY `idx_favorite_decks_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `flashcards`
--

DROP TABLE IF EXISTS `flashcards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flashcards` (
  `is_active` bit(1) NOT NULL,
  `is_deleted` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `item_id` bigint DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL,
  `version` bigint NOT NULL,
  `card_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_type` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `audio_url` longtext COLLATE utf8mb4_unicode_ci,
  `back` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `explanation` longtext COLLATE utf8mb4_unicode_ci,
  `front` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `hint` longtext COLLATE utf8mb4_unicode_ci,
  `image_url` longtext COLLATE utf8mb4_unicode_ci,
  `updated_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_flashcards_item` (`item_type`,`item_id`),
  KEY `idx_flashcards_card_type` (`card_type`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `folders`
--

DROP TABLE IF EXISTS `folders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `folders` (
  `is_active` bit(1) NOT NULL,
  `is_deleted` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL,
  `version` bigint NOT NULL,
  `created_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_folders_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `grammar`
--

DROP TABLE IF EXISTS `grammar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grammar` (
  `jlpt_level` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `exampleen` longtext COLLATE utf8mb4_unicode_ci,
  `examplejp` longtext COLLATE utf8mb4_unicode_ci,
  `explanation` longtext COLLATE utf8mb4_unicode_ci,
  `notes` longtext COLLATE utf8mb4_unicode_ci,
  `pattern` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `related_patterns` longtext COLLATE utf8mb4_unicode_ci,
  `usage` longtext COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `idx_grammar_jlpt_level` (`jlpt_level`),
  KEY `idx_grammar_pattern` (`pattern`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `kanji_srs_records`
--

DROP TABLE IF EXISTS `kanji_srs_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kanji_srs_records` (
  `ease_factor` double NOT NULL,
  `interval_days` int NOT NULL,
  `repetition_count` int NOT NULL,
  `review_count` int NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `last_reviewed_at` datetime(6) DEFAULT NULL,
  `next_review_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL,
  `kanji_character` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_kanji_srs_user_character` (`user_id`,`kanji_character`),
  KEY `idx_kanji_srs_user` (`user_id`),
  KEY `idx_kanji_srs_next_review` (`next_review_at`),
  CONSTRAINT `FK7nwtcp12xsv67ef61u1bfn8f7` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `kanji_srs_review_events`
--

DROP TABLE IF EXISTS `kanji_srs_review_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kanji_srs_review_events` (
  `ease_after` double NOT NULL,
  `interval_after_days` int NOT NULL,
  `successful` bit(1) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `reviewed_at` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL,
  `kanji_character` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_kanji_srs_review_events_user_reviewed` (`user_id`,`reviewed_at`),
  KEY `idx_kanji_srs_review_events_character` (`kanji_character`),
  CONSTRAINT `FKqxrty20twof4ay0as6mui2crv` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `learning_analytics_events`
--

DROP TABLE IF EXISTS `learning_analytics_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `learning_analytics_events` (
  `duration_seconds` int DEFAULT NULL,
  `score` int DEFAULT NULL,
  `jlpt_level` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content_id` bigint NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `session_id` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata_json` longtext COLLATE utf8mb4_unicode_ci,
  `content_type` enum('COURSE','LESSON','QUIZ','STORY') COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_type` enum('ABANDON_LESSON','COMPLETE_LESSON','QUIZ_CORRECT_AFTER_REVIEW','QUIZ_WRONG','START_LEARNING') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_learning_analytics_events_event_created` (`event_type`,`created_at`),
  KEY `idx_learning_analytics_events_content_created` (`content_type`,`content_id`,`created_at`),
  KEY `idx_learning_analytics_events_user_created` (`user_id`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lesson_versions`
--

DROP TABLE IF EXISTS `lesson_versions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lesson_versions` (
  `order_index` int DEFAULT NULL,
  `version_number` int NOT NULL,
  `jlpt_level` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `lesson_id` bigint NOT NULL,
  `change_action` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `audio_url` text COLLATE utf8mb4_unicode_ci,
  `content` longtext COLLATE utf8mb4_unicode_ci,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image_url` text COLLATE utf8mb4_unicode_ci,
  `related_grammar_ids` text COLLATE utf8mb4_unicode_ci,
  `related_quiz_ids` text COLLATE utf8mb4_unicode_ci,
  `related_vocabulary_ids` text COLLATE utf8mb4_unicode_ci,
  `video_url` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `idx_lesson_versions_lesson_id` (`lesson_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lessons`
--

DROP TABLE IF EXISTS `lessons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lessons` (
  `order_index` int DEFAULT NULL,
  `jlpt_level` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `audio_url` text COLLATE utf8mb4_unicode_ci,
  `content` longtext COLLATE utf8mb4_unicode_ci,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image_url` text COLLATE utf8mb4_unicode_ci,
  `related_grammar_ids` text COLLATE utf8mb4_unicode_ci,
  `related_quiz_ids` text COLLATE utf8mb4_unicode_ci,
  `related_vocabulary_ids` text COLLATE utf8mb4_unicode_ci,
  `video_url` text COLLATE utf8mb4_unicode_ci,
  `status` enum('ARCHIVED','DRAFT','PUBLISHED','REVIEW') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_lesson_jlpt_level` (`jlpt_level`),
  KEY `idx_lesson_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `is_read` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `link` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` longtext COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `idx_notification_user` (`user_id`),
  KEY `idx_notification_user_read` (`user_id`,`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) NOT NULL,
  `code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_permission_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `post_bookmarks`
--

DROP TABLE IF EXISTS `post_bookmarks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_bookmarks` (
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `post_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_post_bookmark` (`post_id`,`user_id`),
  KEY `idx_bookmark_post` (`post_id`),
  KEY `idx_bookmark_user` (`user_id`),
  CONSTRAINT `FK9b5c09u5arho7ei76d78bn7ww` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKfjt0ek6fdnu3u921gjgpy1ill` FOREIGN KEY (`post_id`) REFERENCES `community_posts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `post_comments`
--

DROP TABLE IF EXISTS `post_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_comments` (
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `post_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_comment_post` (`post_id`),
  KEY `idx_comment_user` (`user_id`),
  CONSTRAINT `FKl0vhkouibqhyp8fu0i0979wq` FOREIGN KEY (`post_id`) REFERENCES `community_posts` (`id`),
  CONSTRAINT `FKsnxoecngu89u3fh4wdrgf0f2g` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `post_likes`
--

DROP TABLE IF EXISTS `post_likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_likes` (
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `post_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_post_like` (`post_id`,`user_id`),
  KEY `idx_like_post` (`post_id`),
  KEY `idx_like_user` (`user_id`),
  CONSTRAINT `FKhl7eauuj5a85e8jumxyc0l8rh` FOREIGN KEY (`post_id`) REFERENCES `community_posts` (`id`),
  CONSTRAINT `FKkgau5n0nlewg6o9lr4yibqgxj` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `private_messages`
--

DROP TABLE IF EXISTS `private_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `private_messages` (
  `is_read` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `receiver_id` bigint NOT NULL,
  `sender_id` bigint NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKohfx6x8sqhg2mehdc6pnadejw` (`receiver_id`),
  KEY `FK1kix63i73ln942n697wudh9sj` (`sender_id`),
  CONSTRAINT `FK1kix63i73ln942n697wudh9sj` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKohfx6x8sqhg2mehdc6pnadejw` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `quiz_attempts`
--

DROP TABLE IF EXISTS `quiz_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz_attempts` (
  `correct` bit(1) NOT NULL,
  `score` int NOT NULL,
  `attempted_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `quiz_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `mistake_pattern` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `submitted_answer` text COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_quiz_attempts_user_attempted` (`user_id`,`attempted_at`),
  KEY `idx_quiz_attempts_user_quiz` (`user_id`,`quiz_id`),
  KEY `idx_quiz_attempts_pattern` (`mistake_pattern`),
  KEY `FKfwipvfipnnwsoacoyv5k7fbxc` (`quiz_id`),
  CONSTRAINT `FKfwipvfipnnwsoacoyv5k7fbxc` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`),
  CONSTRAINT `FKpj4a9hw0iv1mo1ut6rppg594u` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `quiz_sessions`
--

DROP TABLE IF EXISTS `quiz_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz_sessions` (
  `accuracy_rate` decimal(5,2) NOT NULL,
  `correct_count` int NOT NULL,
  `total_questions` int NOT NULL,
  `completed_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `started_at` datetime(6) NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `mode` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `weakest_pattern` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_quiz_sessions_user_completed` (`user_id`,`completed_at`),
  KEY `idx_quiz_sessions_mode` (`mode`),
  KEY `idx_quiz_sessions_weakest_pattern` (`weakest_pattern`),
  CONSTRAINT `FKkflyth3d76arxn7v9c0fyskqo` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `quizzes`
--

DROP TABLE IF EXISTS `quizzes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quizzes` (
  `jlpt_level` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `lesson_id` bigint DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL,
  `difficulty_level` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `audio_url` text COLLATE utf8mb4_unicode_ci,
  `correct_answer` text COLLATE utf8mb4_unicode_ci,
  `description` text COLLATE utf8mb4_unicode_ci,
  `explanation` text COLLATE utf8mb4_unicode_ci,
  `image_url` text COLLATE utf8mb4_unicode_ci,
  `options` longtext COLLATE utf8mb4_unicode_ci,
  `question` text COLLATE utf8mb4_unicode_ci,
  `quiz_type` enum('FILL_IN_BLANK','LISTENING','MATCHING','MULTIPLE_CHOICE','TRANSLATION','WRITING') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_quiz_level` (`difficulty_level`),
  KEY `idx_quiz_type` (`quiz_type`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `permission_id` bigint NOT NULL,
  `role` enum('ADMIN','USER') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_permission` (`role`,`permission_id`),
  KEY `idx_role_permission_role` (`role`),
  KEY `idx_role_permission_permission` (`permission_id`),
  CONSTRAINT `FKegdk29eiy7mdtefy5c7eirr6e` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `saved_words`
--

DROP TABLE IF EXISTS `saved_words`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saved_words` (
  `ease_factor` double NOT NULL,
  `mastered` bit(1) NOT NULL,
  `repetition_count` int NOT NULL,
  `review_count` int NOT NULL,
  `review_interval_days` int NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `last_reviewed_at` datetime(6) DEFAULT NULL,
  `next_review_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  `vocabulary_id` bigint NOT NULL,
  `folder_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `personal_note` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_saved_word` (`user_id`,`vocabulary_id`),
  KEY `idx_saved_user` (`user_id`),
  KEY `idx_saved_folder` (`folder_name`),
  KEY `FK3jq4tj3qbee9dt303wlovx2h2` (`vocabulary_id`),
  CONSTRAINT `FK3jq4tj3qbee9dt303wlovx2h2` FOREIGN KEY (`vocabulary_id`) REFERENCES `vocabulary` (`id`),
  CONSTRAINT `FKs3sgvrcmipgk7ayu3y7gmcntj` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `srs_algorithm_configs`
--

DROP TABLE IF EXISTS `srs_algorithm_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `srs_algorithm_configs` (
  `enabled` bit(1) NOT NULL,
  `is_active` bit(1) NOT NULL,
  `is_deleted` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) NOT NULL,
  `version` bigint NOT NULL,
  `algorithm_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `config_json` longtext COLLATE utf8mb4_unicode_ci,
  `created_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_srs_config_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `story_mode_stories`
--

DROP TABLE IF EXISTS `story_mode_stories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `story_mode_stories` (
  `estimated_minutes` int NOT NULL,
  `published` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) NOT NULL,
  `jlpt_level` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tone` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cover_label` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entry_segment_id` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `story_key` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtitle` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content_json` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_story_mode_story_key` (`story_key`),
  KEY `idx_story_mode_published` (`published`),
  KEY `idx_story_mode_jlpt` (`jlpt_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `is_active` bit(1) NOT NULL,
  `is_deleted` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `version` bigint NOT NULL,
  `color` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tags_user` (`user_id`),
  KEY `idx_tags_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `translation_history`
--

DROP TABLE IF EXISTS `translation_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `translation_history` (
  `bookmarked` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `source_lang` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_lang` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_text` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `translated_text` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_trans_user_id` (`user_id`),
  KEY `idx_trans_created_at` (`created_at`),
  KEY `idx_trans_source_lang` (`source_lang`),
  KEY `idx_trans_target_lang` (`target_lang`),
  CONSTRAINT `FKqgd6ws42gjwyu2yv1sc5u0y36` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_connections`
--

DROP TABLE IF EXISTS `user_connections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_connections` (
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `receiver_id` bigint NOT NULL,
  `requester_id` bigint NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `connection_type` enum('FOLLOW','FRIEND') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('ACCEPTED','PENDING') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKj8wkityfcmb3ghxn3gd7bodug` (`requester_id`,`receiver_id`,`connection_type`),
  KEY `FKe6h0nyor85j3y4og0gfeslkmr` (`receiver_id`),
  CONSTRAINT `FK87a2325ovm813njp71xwmk6yt` FOREIGN KEY (`requester_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKe6h0nyor85j3y4og0gfeslkmr` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_learning_stats`
--

DROP TABLE IF EXISTS `user_learning_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_learning_stats` (
  `current_streak` int NOT NULL,
  `grammar_learned` int NOT NULL,
  `last_learning_date` date DEFAULT NULL,
  `lessons_completed` int NOT NULL,
  `longest_streak` int NOT NULL,
  `quizzes_completed` int NOT NULL,
  `total_learning_minutes` int NOT NULL,
  `totalxp` int NOT NULL,
  `vocabulary_learned` int NOT NULL,
  `targetjlptlevel` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) NOT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_stats` (`user_id`),
  KEY `idx_user_learning_stats_user_id` (`user_id`),
  CONSTRAINT `FKjciy07wuf0dj88b1mryb6fqg4` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_progress`
--

DROP TABLE IF EXISTS `user_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_progress` (
  `attempt_count` int DEFAULT NULL,
  `score` int DEFAULT NULL,
  `total_score` int DEFAULT NULL,
  `completed_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `lesson_id` bigint DEFAULT NULL,
  `quiz_id` bigint DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `vocabulary_id` bigint DEFAULT NULL,
  `progress_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `status` enum('COMPLETED','IN_PROGRESS','NOT_STARTED') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_lesson` (`user_id`,`lesson_id`),
  UNIQUE KEY `uk_user_quiz` (`user_id`,`quiz_id`),
  KEY `idx_user_progress_user_id` (`user_id`),
  KEY `idx_user_progress_status` (`status`),
  CONSTRAINT `FKrt37sneeps21829cuqetjm5ye` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_id` bigint NOT NULL,
  `role` enum('ADMIN','USER') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`user_id`,`role`),
  CONSTRAINT `FKhfh9dx7w3ubf1co1vdev94g3f` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_settings`
--

DROP TABLE IF EXISTS `user_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_settings` (
  `auto_play_audio` bit(1) NOT NULL,
  `daily_goal_minutes` int NOT NULL,
  `email_notifications` bit(1) NOT NULL,
  `jlpt_deadline_date` date DEFAULT NULL,
  `push_notifications` bit(1) NOT NULL,
  `show_furigana` bit(1) NOT NULL,
  `show_romaji` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL,
  `target_jlpt_level` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `language` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quiz_difficulty` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `theme` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_settings_user` (`user_id`),
  CONSTRAINT `FK8v82nj88rmai0nyck19f873dw` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `enabled` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `password_reset_expires_at` datetime(6) DEFAULT NULL,
  `password_reset_requested_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL,
  `display_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_reset_token_hash` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vocabulary`
--

DROP TABLE IF EXISTS `vocabulary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vocabulary` (
  `jlpt_level` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) NOT NULL,
  `word_type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `additional_notes` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `example_sentenceen` longtext COLLATE utf8mb4_unicode_ci,
  `example_sentencejp` longtext COLLATE utf8mb4_unicode_ci,
  `hiragana` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kanji` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `meaning` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `romaji` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKbsgw8fjoq7hh218nfg1mp3r18` (`kanji`),
  KEY `idx_vocab_jlpt_level` (`jlpt_level`),
  KEY `idx_vocab_kanji` (`kanji`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed
