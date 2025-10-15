/*
  # Initial Schema for Family Creative Projects Platform

  ## Overview
  This migration creates the foundational database structure for a family creative project management system.
  The system allows family members (Jacob, Abby, Ben, Rox) to create, store, and manage creative projects
  including games, apps, stories, and artwork.

  ## Tables Created

  ### 1. profiles
  Stores family member information for authentication and project ownership.
  - `id` (uuid, primary key): Unique identifier for each family member
  - `name` (text): Display name (Jacob, Abby, Ben, or Rox)
  - `avatar_url` (text): URL to profile picture or icon
  - `created_at` (timestamptz): Account creation timestamp

  ### 2. projects
  Stores metadata for all creative projects created by family members.
  - `id` (uuid, primary key): Unique project identifier
  - `title` (text): Project title
  - `description` (text): Project description
  - `type` (text): Project category (game, app, story, art)
  - `thumbnail_url` (text): Path/URL to project thumbnail
  - `created_by` (uuid, foreign key): References profiles.id
  - `created_at` (timestamptz): Project creation timestamp
  - `updated_at` (timestamptz): Last modification timestamp

  ### 3. project_files
  Stores file information associated with projects (supports multiple files per project).
  - `id` (uuid, primary key): Unique file identifier
  - `project_id` (uuid, foreign key): References projects.id
  - `file_name` (text): Original filename
  - `file_path` (text): Storage path (unique)
  - `file_type` (text): MIME type
  - `file_size` (bigint): File size in bytes
  - `created_at` (timestamptz): Upload timestamp

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Policies allow family members to:
    - Read all profiles
    - Read all projects
    - Create their own projects
    - Update/delete only their own projects
    - Manage files only for their own projects

  ## HOW TO USE THIS FILE
  1. Go to your Supabase Dashboard: https://supabase.com/dashboard
  2. Select your project
  3. Click "SQL Editor" in the left sidebar
  4. Click "New Query"
  5. Copy and paste this entire file
  6. Click "Run" to execute
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

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;

-- Profiles policies: Everyone can read all profiles
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Projects policies: Read all, but only manage your own
CREATE POLICY "Anyone can view all projects"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Project files policies: Only manage files for your own projects
CREATE POLICY "Anyone can view project files"
  ON project_files FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_files.project_id
    )
  );

CREATE POLICY "Users can add files to own projects"
  ON project_files FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_files.project_id
      AND projects.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete files from own projects"
  ON project_files FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_files.project_id
      AND projects.created_by = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);

-- Insert initial family member profiles
INSERT INTO profiles (name, avatar_url) VALUES
  ('Jacob', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jacob'),
  ('Abby', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Abby'),
  ('Ben', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ben'),
  ('Rox', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rox')
ON CONFLICT (id) DO NOTHING;
