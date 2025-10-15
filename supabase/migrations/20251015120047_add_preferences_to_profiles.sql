/*
  # Add preferences column to profiles table

  1. Changes
    - Add `preferences` column to profiles table (jsonb type)
    - Default value is empty object
    - Used for storing user preferences like theme selection

  2. Notes
    - Non-destructive change, preserves all existing data
    - Preferences will be stored as JSON objects
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'preferences'
  ) THEN
    ALTER TABLE profiles ADD COLUMN preferences jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;