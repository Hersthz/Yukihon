IF COL_LENGTH('user_settings', 'jlpt_deadline_date') IS NULL
BEGIN
    ALTER TABLE user_settings
    ADD jlpt_deadline_date DATE NULL;
END;
