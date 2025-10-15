/*
  # Family Arsenal/Toolkit System

  ## Overview
  A practical toolkit for accessing external apps and services. Organized by category
  with support for embeds and quick launch.

  ## New Tables

  ### 1. toolkit_categories
  Organizational categories for tools
  - `id` (uuid, primary key): Category identifier
  - `name` (text): Category name (Music, Games, Learning, etc.)
  - `icon` (text): Icon identifier
  - `color` (text): Category color hex
  - `sort_order` (integer): Display order
  - `created_at` (timestamptz): Creation timestamp

  ### 2. toolkit_items
  Individual tools and apps in the arsenal
  - `id` (uuid, primary key): Tool identifier
  - `category_id` (uuid, foreign key): References toolkit_categories.id
  - `name` (text): Tool/app name
  - `description` (text): What it does
  - `icon_url` (text): Tool icon/logo
  - `url` (text): Launch URL or embed URL
  - `embed_type` (text): Type of embed (spotify, youtube, external, etc.)
  - `embed_code` (text): Custom embed code if needed
  - `is_embeddable` (boolean): Can be embedded in panel
  - `is_active` (boolean): Visible to family
  - `added_by` (uuid): User who added it
  - `created_at` (timestamptz): Creation timestamp

  ### 3. toolkit_favorites
  User favorites for quick access
  - `id` (uuid, primary key): Favorite identifier
  - `user_id` (uuid, foreign key): References profiles.id
  - `tool_id` (uuid, foreign key): References toolkit_items.id
  - `created_at` (timestamptz): When favorited

  ## Security
  - Row Level Security enabled on all tables
  - Everyone can view tools
  - Family members can add and favorite tools
*/

-- Create toolkit_categories table
CREATE TABLE IF NOT EXISTS toolkit_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL DEFAULT '#6b7280',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create toolkit_items table
CREATE TABLE IF NOT EXISTS toolkit_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES toolkit_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  icon_url text,
  url text NOT NULL,
  embed_type text NOT NULL DEFAULT 'external',
  embed_code text,
  is_embeddable boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  added_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create toolkit_favorites table
CREATE TABLE IF NOT EXISTS toolkit_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tool_id uuid NOT NULL REFERENCES toolkit_items(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, tool_id)
);

-- Enable Row Level Security
ALTER TABLE toolkit_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE toolkit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE toolkit_favorites ENABLE ROW LEVEL SECURITY;

-- Categories policies (read-only for everyone)
CREATE POLICY "Anyone can view categories"
  ON toolkit_categories FOR SELECT
  USING (true);

-- Toolkit items policies
CREATE POLICY "Anyone can view active tools"
  ON toolkit_items FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can add tools"
  ON toolkit_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own tools"
  ON toolkit_items FOR UPDATE
  USING (added_by = (SELECT id FROM profiles WHERE auth.uid() = id))
  WITH CHECK (added_by = (SELECT id FROM profiles WHERE auth.uid() = id));

-- Favorites policies
CREATE POLICY "Users can view all favorites"
  ON toolkit_favorites FOR SELECT
  USING (true);

CREATE POLICY "Users can add favorites"
  ON toolkit_favorites FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can remove own favorites"
  ON toolkit_favorites FOR DELETE
  USING (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_toolkit_items_category ON toolkit_items(category_id);
CREATE INDEX IF NOT EXISTS idx_toolkit_items_active ON toolkit_items(is_active);
CREATE INDEX IF NOT EXISTS idx_toolkit_favorites_user ON toolkit_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_toolkit_favorites_tool ON toolkit_favorites(tool_id);

-- Insert default categories
INSERT INTO toolkit_categories (name, icon, color, sort_order) VALUES
  ('Music & Audio', 'Music', '#22c55e', 1),
  ('Entertainment', 'Film', '#ec4899', 2),
  ('Learning', 'GraduationCap', '#3b82f6', 3),
  ('Gaming', 'Gamepad2', '#a855f7', 4),
  ('Creative', 'Palette', '#f59e0b', 5),
  ('Communication', 'MessageSquare', '#06b6d4', 6),
  ('Utilities', 'Wrench', '#6b7280', 7)
ON CONFLICT DO NOTHING;

-- Insert default tools
INSERT INTO toolkit_items (category_id, name, description, icon_url, url, embed_type, is_embeddable) 
SELECT 
  (SELECT id FROM toolkit_categories WHERE name = 'Music & Audio'),
  'Spotify',
  'Stream music, podcasts, and playlists together',
  'https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png',
  'https://open.spotify.com',
  'spotify',
  true
WHERE NOT EXISTS (SELECT 1 FROM toolkit_items WHERE name = 'Spotify');

INSERT INTO toolkit_items (category_id, name, description, icon_url, url, embed_type, is_embeddable)
SELECT 
  (SELECT id FROM toolkit_categories WHERE name = 'Entertainment'),
  'YouTube',
  'Watch videos, tutorials, and entertainment',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/240px-YouTube_full-color_icon_%282017%29.svg.png',
  'https://youtube.com',
  'youtube',
  true
WHERE NOT EXISTS (SELECT 1 FROM toolkit_items WHERE name = 'YouTube');

INSERT INTO toolkit_items (category_id, name, description, icon_url, url, embed_type, is_embeddable)
SELECT 
  (SELECT id FROM toolkit_categories WHERE name = 'Entertainment'),
  'Disney+',
  'Stream Disney movies and shows',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Disney%2B_logo.svg/220px-Disney%2B_logo.svg.png',
  'https://disneyplus.com',
  'external',
  false
WHERE NOT EXISTS (SELECT 1 FROM toolkit_items WHERE name = 'Disney+');

INSERT INTO toolkit_items (category_id, name, description, icon_url, url, embed_type, is_embeddable)
SELECT 
  (SELECT id FROM toolkit_categories WHERE name = 'Entertainment'),
  'Netflix',
  'Watch movies and series together',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/220px-Netflix_2015_logo.svg.png',
  'https://netflix.com',
  'external',
  false
WHERE NOT EXISTS (SELECT 1 FROM toolkit_items WHERE name = 'Netflix');

INSERT INTO toolkit_items (category_id, name, description, icon_url, url, embed_type, is_embeddable)
SELECT 
  (SELECT id FROM toolkit_categories WHERE name = 'Learning'),
  'Khan Academy',
  'Free learning resources for all ages',
  'https://cdn.kastatic.org/images/khan-logo-dark-background.png',
  'https://khanacademy.org',
  'external',
  false
WHERE NOT EXISTS (SELECT 1 FROM toolkit_items WHERE name = 'Khan Academy');

INSERT INTO toolkit_items (category_id, name, description, icon_url, url, embed_type, is_embeddable)
SELECT 
  (SELECT id FROM toolkit_categories WHERE name = 'Learning'),
  'Scratch',
  'Learn coding through visual programming',
  'https://scratch.mit.edu/images/logo_sm.png',
  'https://scratch.mit.edu',
  'external',
  false
WHERE NOT EXISTS (SELECT 1 FROM toolkit_items WHERE name = 'Scratch');

INSERT INTO toolkit_items (category_id, name, description, icon_url, url, embed_type, is_embeddable)
SELECT 
  (SELECT id FROM toolkit_categories WHERE name = 'Gaming'),
  'Roblox',
  'Play and create games with friends',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Roblox_Logo.svg/220px-Roblox_Logo.svg.png',
  'https://roblox.com',
  'external',
  false
WHERE NOT EXISTS (SELECT 1 FROM toolkit_items WHERE name = 'Roblox');

INSERT INTO toolkit_items (category_id, name, description, icon_url, url, embed_type, is_embeddable)
SELECT 
  (SELECT id FROM toolkit_categories WHERE name = 'Gaming'),
  'Minecraft',
  'Build and explore together',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Minecraft_logo.svg/220px-Minecraft_logo.svg.png',
  'https://minecraft.net',
  'external',
  false
WHERE NOT EXISTS (SELECT 1 FROM toolkit_items WHERE name = 'Minecraft');

INSERT INTO toolkit_items (category_id, name, description, icon_url, url, embed_type, is_embeddable)
SELECT 
  (SELECT id FROM toolkit_categories WHERE name = 'Creative'),
  'Canva',
  'Design graphics, presentations, and more',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Canva_icon_2021.svg/220px-Canva_icon_2021.svg.png',
  'https://canva.com',
  'external',
  false
WHERE NOT EXISTS (SELECT 1 FROM toolkit_items WHERE name = 'Canva');

INSERT INTO toolkit_items (category_id, name, description, icon_url, url, embed_type, is_embeddable)
SELECT 
  (SELECT id FROM toolkit_categories WHERE name = 'Communication'),
  'Zoom',
  'Video calls with family and friends',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Zoom_Logo.svg/220px-Zoom_Logo.svg.png',
  'https://zoom.us',
  'external',
  false
WHERE NOT EXISTS (SELECT 1 FROM toolkit_items WHERE name = 'Zoom');