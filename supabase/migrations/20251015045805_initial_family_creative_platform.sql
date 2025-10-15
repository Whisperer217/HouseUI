/*
  # Initial Schema for Family Creative Projects Platform

  ## Overview
  This migration creates the foundational database structure for a family creative project management system.
  The system allows family members to create, store, and manage creative projects and chat messages.

  ## Tables Created

  ### 1. profiles
  Stores family member information
  - `id` (uuid, primary key): Unique identifier for each family member
  - `name` (text): Display name (Jacob, Abby, Ben, or Rox)
  - `avatar_url` (text): URL to profile picture or icon
  - `created_at` (timestamptz): Account creation timestamp

  ### 2. projects
  Stores metadata for all creative projects
  - `id` (uuid, primary key): Unique project identifier
  - `title` (text): Project title
  - `description` (text): Project description
  - `type` (text): Project category (game, app, story, art)
  - `thumbnail_url` (text): Path/URL to project thumbnail
  - `created_by` (uuid, foreign key): References profiles.id
  - `created_at` (timestamptz): Project creation timestamp
  - `updated_at` (timestamptz): Last modification timestamp

  ### 3. project_files
  Stores file information associated with projects
  - `id` (uuid, primary key): Unique file identifier
  - `project_id` (uuid, foreign key): References projects.id
  - `file_name` (text): Original filename
  - `file_path` (text): Storage path (unique)
  - `file_type` (text): MIME type
  - `file_size` (bigint): File size in bytes
  - `created_at` (timestamptz): Upload timestamp

  ### 4. chat_messages
  Stores all chat messages including AI responses
  - `id` (uuid, primary key): Unique message identifier
  - `user_id` (uuid, foreign key): References profiles.id
  - `message` (text): The message content
  - `is_ai` (boolean): Whether this is an AI-generated message
  - `created_at` (timestamptz): Message timestamp

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Policies allow family members to read and manage their content appropriately
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  type text NOT NULL CHECK (type IN ('game', 'app', 'story', 'art')),
  thumbnail_url text,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create project_files table
CREATE TABLE IF NOT EXISTS project_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL UNIQUE,
  file_type text NOT NULL,
  file_size bigint DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  message text NOT NULL,
  is_ai boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Anyone can view all projects"
  ON projects FOR SELECT
  USING (true);

CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (created_by = (SELECT id FROM profiles WHERE auth.uid() = id))
  WITH CHECK (created_by = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (created_by = (SELECT id FROM profiles WHERE auth.uid() = id));

-- Project files policies
CREATE POLICY "Anyone can view project files"
  ON project_files FOR SELECT
  USING (true);

CREATE POLICY "Users can add files to projects"
  ON project_files FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete files from own projects"
  ON project_files FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_files.project_id
      AND projects.created_by = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  );

-- Chat policies
CREATE POLICY "Anyone can view chat messages"
  ON chat_messages FOR SELECT
  USING (true);

CREATE POLICY "Users can create messages"
  ON chat_messages FOR INSERT
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- Insert initial family member profiles
INSERT INTO profiles (name, avatar_url) VALUES
  ('Jacob', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jacob'),
  ('Abby', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Abby'),
  ('Ben', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ben'),
  ('Rox', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rox')
ON CONFLICT DO NOTHING;