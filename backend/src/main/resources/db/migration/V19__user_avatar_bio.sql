-- Profile avatar + bio for users. Avatar is a media URL (uploaded via /api/media/upload).
ALTER TABLE `users` ADD COLUMN `avatar_url` longtext COLLATE utf8mb4_unicode_ci;
ALTER TABLE `users` ADD COLUMN `bio` varchar(500) COLLATE utf8mb4_unicode_ci;
