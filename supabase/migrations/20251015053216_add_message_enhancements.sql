/*
  # Enhanced Chat Message Features

  ## Overview
  Add reactions, pinning, voice messages, and improved file handling to chat system

  ## Changes to Existing Tables

  ### thread_messages
  - Add `reactions` (jsonb): Store emoji reactions with user IDs
    Format: {"👍": ["user1", "user2"], "❤️": ["user3"]}
  - Add `is_pinned` (boolean): Pin important messages to top of thread
  - Add `pinned_at` (timestamptz): When message was pinned
  - Add `pinned_by` (text): Who pinned the message
  - Add `message_type` (text): 'text', 'voice', 'code', 'image'
  - Add `code_language` (text): Programming language for syntax highlighting
  - Add `voice_duration` (integer): Duration of voice message in seconds

  ### message_files
  - Add `is_preview` (boolean): Whether file is a preview/thumbnail
  - Add `preview_generated` (boolean): Whether preview has been generated

  ## Indexes
  - Add index on is_pinned for quick pinned message queries
  - Add index on message_type for filtering by type

  ## Security
  - Existing RLS policies cover new fields
*/

-- Add new columns to thread_messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'thread_messages' AND column_name = 'reactions'
  ) THEN
    ALTER TABLE thread_messages ADD COLUMN reactions jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'thread_messages' AND column_name = 'is_pinned'
  ) THEN
    ALTER TABLE thread_messages ADD COLUMN is_pinned boolean NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'thread_messages' AND column_name = 'pinned_at'
  ) THEN
    ALTER TABLE thread_messages ADD COLUMN pinned_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'thread_messages' AND column_name = 'pinned_by'
  ) THEN
    ALTER TABLE thread_messages ADD COLUMN pinned_by text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'thread_messages' AND column_name = 'message_type'
  ) THEN
    ALTER TABLE thread_messages ADD COLUMN message_type text NOT NULL DEFAULT 'text';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'thread_messages' AND column_name = 'code_language'
  ) THEN
    ALTER TABLE thread_messages ADD COLUMN code_language text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'thread_messages' AND column_name = 'voice_duration'
  ) THEN
    ALTER TABLE thread_messages ADD COLUMN voice_duration integer;
  END IF;
END $$;

-- Add new columns to message_files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'message_files' AND column_name = 'is_preview'
  ) THEN
    ALTER TABLE message_files ADD COLUMN is_preview boolean NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'message_files' AND column_name = 'preview_generated'
  ) THEN
    ALTER TABLE message_files ADD COLUMN preview_generated boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_thread_messages_pinned ON thread_messages(thread_id, is_pinned, pinned_at DESC) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_thread_messages_type ON thread_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_message_files_preview ON message_files(message_id, is_preview);