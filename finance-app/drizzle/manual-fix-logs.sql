-- Add missing columns to logs table if they don't exist
DO $$ 
BEGIN
    -- Add resolved column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'logs' AND column_name = 'resolved'
    ) THEN
        ALTER TABLE logs ADD COLUMN resolved boolean DEFAULT false NOT NULL;
    END IF;

    -- Add resolved_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'logs' AND column_name = 'resolved_at'
    ) THEN
        ALTER TABLE logs ADD COLUMN resolved_at timestamp;
    END IF;

    -- Add resolved_by column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'logs' AND column_name = 'resolved_by'
    ) THEN
        ALTER TABLE logs ADD COLUMN resolved_by text;
    END IF;
END $$;

-- Update existing logs to have resolved = false
UPDATE logs SET resolved = false WHERE resolved IS NULL;
