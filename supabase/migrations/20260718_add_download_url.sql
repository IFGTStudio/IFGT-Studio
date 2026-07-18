-- Add download_url column to games table
ALTER TABLE games ADD COLUMN IF NOT EXISTS download_url TEXT;
