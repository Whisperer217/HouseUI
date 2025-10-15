/*
  # Add Templates and Social Features

  ## Overview
  Adds project templates, favorites, and collaboration features for enhanced family engagement.

  ## New Tables

  ### 1. project_templates
  Pre-built templates that families can use to start projects
  - `id` (uuid, primary key): Template identifier
  - `title` (text): Template name
  - `description` (text): What the template does
  - `type` (text): Project category
  - `thumbnail_url` (text): Preview image
  - `template_data` (jsonb): Template configuration and starter code
  - `created_at` (timestamptz): Creation timestamp

  ### 2. project_favorites
  Tracks which projects family members have favorited
  - `id` (uuid, primary key): Favorite record identifier
  - `project_id` (uuid, foreign key): References projects.id
  - `user_id` (uuid, foreign key): References profiles.id
  - `created_at` (timestamptz): When favorited

  ### 3. project_comments
  Comments and reactions on projects
  - `id` (uuid, primary key): Comment identifier
  - `project_id` (uuid, foreign key): References projects.id
  - `user_id` (uuid, foreign key): References profiles.id
  - `comment` (text): Comment text
  - `reaction` (text): Optional reaction emoji
  - `created_at` (timestamptz): Comment timestamp

  ## Security
  - Row Level Security enabled on all tables
  - Everyone can view templates
  - Users can manage their own favorites and comments
*/

-- Create project_templates table
CREATE TABLE IF NOT EXISTS project_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('game', 'app', 'story', 'art')),
  thumbnail_url text,
  template_data jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create project_favorites table
CREATE TABLE IF NOT EXISTS project_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Create project_comments table
CREATE TABLE IF NOT EXISTS project_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  comment text,
  reaction text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;

-- Templates policies (read-only for everyone)
CREATE POLICY "Anyone can view templates"
  ON project_templates FOR SELECT
  USING (true);

-- Favorites policies
CREATE POLICY "Anyone can view favorites"
  ON project_favorites FOR SELECT
  USING (true);

CREATE POLICY "Users can add favorites"
  ON project_favorites FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can remove own favorites"
  ON project_favorites FOR DELETE
  USING (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

-- Comments policies
CREATE POLICY "Anyone can view comments"
  ON project_comments FOR SELECT
  USING (true);

CREATE POLICY "Users can add comments"
  ON project_comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own comments"
  ON project_comments FOR UPDATE
  USING (user_id = (SELECT id FROM profiles WHERE auth.uid() = id))
  WITH CHECK (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can delete own comments"
  ON project_comments FOR DELETE
  USING (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_project_favorites_project_id ON project_favorites(project_id);
CREATE INDEX IF NOT EXISTS idx_project_favorites_user_id ON project_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_project_id ON project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_created_at ON project_comments(created_at DESC);

-- Insert starter templates
INSERT INTO project_templates (title, description, type, thumbnail_url, template_data) VALUES
  (
    'Platformer Game',
    'Jump and run through levels! Collect coins and avoid obstacles.',
    'game',
    'https://images.pexels.com/photos/163077/mario-yoschi-figures-funny-163077.jpeg?auto=compress&cs=tinysrgb&w=400',
    '{"starter_code": "game_platformer", "features": ["jumping", "collision", "scoring"]}'
  ),
  (
    'Drawing Canvas',
    'Create digital art with brushes, colors, and effects.',
    'art',
    'https://images.pexels.com/photos/1053687/pexels-photo-1053687.jpeg?auto=compress&cs=tinysrgb&w=400',
    '{"starter_code": "canvas_app", "features": ["drawing", "colors", "tools"]}'
  ),
  (
    'Todo List App',
    'Track tasks and stay organized with a simple todo manager.',
    'app',
    'https://images.pexels.com/photos/3243/pen-calendar-to-do-checklist.jpg?auto=compress&cs=tinysrgb&w=400',
    '{"starter_code": "todo_app", "features": ["add", "complete", "delete"]}'
  ),
  (
    'Adventure Story',
    'Write an interactive story where readers make choices.',
    'story',
    'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=400',
    '{"starter_code": "story_template", "features": ["chapters", "choices", "endings"]}'
  ),
  (
    'Memory Game',
    'Match pairs of cards in this classic memory challenge.',
    'game',
    'https://images.pexels.com/photos/8111855/pexels-photo-8111855.jpeg?auto=compress&cs=tinysrgb&w=400',
    '{"starter_code": "memory_game", "features": ["cards", "matching", "timer"]}'
  ),
  (
    'Music Player',
    'Build a simple music player with playlists and controls.',
    'app',
    'https://images.pexels.com/photos/744318/pexels-photo-744318.jpeg?auto=compress&cs=tinysrgb&w=400',
    '{"starter_code": "music_player", "features": ["play", "pause", "playlist"]}'
  )
ON CONFLICT DO NOTHING;