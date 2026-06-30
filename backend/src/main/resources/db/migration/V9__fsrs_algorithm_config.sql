-- Seed the FSRS algorithm preset so existing databases can switch decks to FSRS.
INSERT INTO `srs_algorithm_configs`
  (`code`, `name`, `algorithm_type`, `config_json`, `enabled`, `is_active`, `is_deleted`, `version`, `created_at`, `updated_at`)
SELECT 'FSRS_DEFAULT', 'FSRS-5 (py-fsrs)', 'FSRS', '{"maxIntervalDays":36500}', 1, 1, 0, 0, NOW(6), NOW(6)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `srs_algorithm_configs` WHERE `code` = 'FSRS_DEFAULT');
