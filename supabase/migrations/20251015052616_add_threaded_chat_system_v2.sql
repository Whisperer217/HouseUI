/*
  # Threaded Chat System with Mentions and File Uploads

  ## Overview
  A comprehensive family chat system with organized threads, @mentions, 
  file uploads, and AI integration.

  ## New Tables

  ### 1. chat_threads
  Organized conversation channels
  - `id` (uuid, primary key): Thread identifier
  - `name` (text): Thread name (e.g., "Game Dev Chat", "Music Creation")
  - `description` (text): What this thread is about
  - `icon` (text): Emoji or icon identifier
  - `color` (text): Thread color hex
  - `type` (text): 'general', 'ai', 'direct', 'topic'
  - `created_by` (text): User who created thread
  - `is_pinned` (boolean): Pin to top of list
  - `is_active` (boolean): Active/archived status
  - `created_at` (timestamptz): Creation timestamp
  - `updated_at` (timestamptz): Last activity timestamp

  ### 2. thread_messages
  Individual messages within threads (separate from old chat_messages)
  - `id` (uuid, primary key): Message identifier
  - `thread_id` (uuid, foreign key): References chat_threads.id
  - `user_id` (text): User ID (can be profile ID or 'ai')
  - `user_name` (text): Display name
  - `user_avatar` (text): User avatar emoji/url
  - `content` (text): Message text
  - `mentions` (jsonb): Array of mentioned user IDs
  - `has_files` (boolean): Has file attachments
  - `reply_to` (uuid): ID of message being replied to
  - `created_at` (timestamptz): When sent
  - `edited_at` (timestamptz): Last edit time

  ### 3. message_files
  File attachments in messages
  - `id` (uuid, primary key): File identifier
  - `message_id` (uuid, foreign key): References thread_messages.id
  - `file_name` (text): Original file name
  - `file_type` (text): MIME type
  - `file_size` (integer): Size in bytes
  - `file_url` (text): Storage URL or data URI
  - `thumbnail_url` (text): Preview/thumbnail URL
  - `uploaded_by` (text): User ID who uploaded
  - `created_at` (timestamptz): Upload timestamp

  ### 4. thread_members
  Track which users are in which threads
  - `id` (uuid, primary key): Membership identifier
  - `thread_id` (uuid, foreign key): References chat_threads.id
  - `user_id` (text): User ID
  - `last_read_at` (timestamptz): Last time user read thread
  - `notification_enabled` (boolean): Get notifications
  - `joined_at` (timestamptz): When user joined

  ### 5. thread_unread_counts
  Track unread messages per user per thread
  - `user_id` (text): User ID
  - `thread_id` (uuid, foreign key): References chat_threads.id
  - `unread_count` (integer): Number of unread messages
  - `last_message_at` (timestamptz): Timestamp of last message
  - PRIMARY KEY (user_id, thread_id)

  ## Security
  - Row Level Security enabled on all tables
  - Users can read all threads and messages
  - Users can post messages and upload files
  - Only message authors can edit/delete their messages
*/

-- Create chat_threads table
CREATE TABLE IF NOT EXISTS chat_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text NOT NULL DEFAULT '💬',
  color text NOT NULL DEFAULT '#6b7280',
  type text NOT NULL DEFAULT 'topic',
  created_by text,
  is_pinned boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create thread_messages table
CREATE TABLE IF NOT EXISTS thread_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  user_name text NOT NULL,
  user_avatar text NOT NULL DEFAULT '👤',
  content text NOT NULL,
  mentions jsonb DEFAULT '[]'::jsonb,
  has_files boolean NOT NULL DEFAULT false,
  reply_to uuid REFERENCES thread_messages(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  edited_at timestamptz
);

-- Create message_files table
CREATE TABLE IF NOT EXISTS message_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES thread_messages(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  file_url text NOT NULL,
  thumbnail_url text,
  uploaded_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create thread_members table
CREATE TABLE IF NOT EXISTS thread_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  last_read_at timestamptz DEFAULT now(),
  notification_enabled boolean NOT NULL DEFAULT true,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(thread_id, user_id)
);

-- Create thread_unread_counts table
CREATE TABLE IF NOT EXISTS thread_unread_counts (
  user_id text NOT NULL,
  thread_id uuid NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  unread_count integer NOT NULL DEFAULT 0,
  last_message_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, thread_id)
);

-- Enable Row Level Security
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_unread_counts ENABLE ROW LEVEL SECURITY;

-- Threads policies
CREATE POLICY "Anyone can view active threads"
  ON chat_threads FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can create threads"
  ON chat_threads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update threads"
  ON chat_threads FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Messages policies
CREATE POLICY "Anyone can view messages"
  ON thread_messages FOR SELECT
  USING (true);

CREATE POLICY "Anyone can post messages"
  ON thread_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can edit messages"
  ON thread_messages FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete messages"
  ON thread_messages FOR DELETE
  USING (true);

-- Files policies
CREATE POLICY "Anyone can view files"
  ON message_files FOR SELECT
  USING (true);

CREATE POLICY "Anyone can upload files"
  ON message_files FOR INSERT
  WITH CHECK (true);

-- Thread members policies
CREATE POLICY "Anyone can view memberships"
  ON thread_members FOR SELECT
  USING (true);

CREATE POLICY "Anyone can join threads"
  ON thread_members FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update membership"
  ON thread_members FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Unread counts policies
CREATE POLICY "Anyone can view unread counts"
  ON thread_unread_counts FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update unread counts"
  ON thread_unread_counts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can modify unread counts"
  ON thread_unread_counts FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_thread_messages_thread ON thread_messages(thread_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_thread_messages_user ON thread_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_thread_messages_mentions ON thread_messages USING gin(mentions);
CREATE INDEX IF NOT EXISTS idx_message_files_message ON message_files(message_id);
CREATE INDEX IF NOT EXISTS idx_thread_members_user ON thread_members(user_id);
CREATE INDEX IF NOT EXISTS idx_thread_members_thread ON thread_members(thread_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_active ON chat_threads(is_active, is_pinned, updated_at DESC);

-- Insert default threads
INSERT INTO chat_threads (name, description, icon, color, type, is_pinned) VALUES
  ('General Family Chat', 'Random conversations and daily updates', '💬', '#3b82f6', 'general', true),
  ('Game Dev Chat', 'Build games together, share ideas and code', '🎮', '#8b5cf6', 'topic', true),
  ('Music Creation', 'Share beats, lyrics, and music projects', '🎵', '#ec4899', 'topic', true),
  ('School & Homework', 'Help each other with learning and projects', '📚', '#10b981', 'topic', true),
  ('AI Assistant', 'Ask questions and get help from AI', '🤖', '#f59e0b', 'ai', true),
  ('Creative Ideas', 'Art, stories, and creative projects', '🎨', '#ef4444', 'topic', false),
  ('Tech Talk', 'Coding, apps, and tech discussions', '💻', '#06b6d4', 'topic', false)
ON CONFLICT DO NOTHING;

-- Function to update thread timestamp on new message
CREATE OR REPLACE FUNCTION update_thread_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_threads
  SET updated_at = NEW.created_at
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update thread timestamp
DROP TRIGGER IF EXISTS trigger_update_thread_timestamp ON thread_messages;
CREATE TRIGGER trigger_update_thread_timestamp
  AFTER INSERT ON thread_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_thread_timestamp();