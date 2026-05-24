-- Add language column to user_settings table
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'id';

-- Add comment
COMMENT ON COLUMN user_settings.language IS 'User preferred language: id (Indonesian) or en (English)';
