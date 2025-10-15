-- ============================================
-- SEED DATA FOR FAMILY CREATIVE PLATFORM
-- ============================================
-- Copy and paste this into your Supabase SQL Editor
-- This temporarily disables RLS to insert seed data
-- ============================================

-- Temporarily disable RLS for seeding
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE toolkit_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE toolkit_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_threads DISABLE ROW LEVEL SECURITY;

-- 1. CREATE FAMILY PROFILES
INSERT INTO profiles (id, name, avatar_url, preferences) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Jacob', '👨', '{"theme": "dark"}'::jsonb),
  ('22222222-2222-2222-2222-222222222222', 'Abby', '👧', '{"theme": "unicorn"}'::jsonb),
  ('33333333-3333-3333-3333-333333333333', 'Ben', '👦', '{"theme": "forest"}'::jsonb),
  ('44444444-4444-4444-4444-444444444444', 'Rox', '🐕', '{"theme": "sunset"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  avatar_url = EXCLUDED.avatar_url,
  preferences = EXCLUDED.preferences;

-- 2. CREATE SAMPLE PROJECTS
INSERT INTO projects (title, description, type, thumbnail_url, created_by) VALUES
  ('Space Adventure Game', 'Explore the galaxy and discover new planets', 'game', 'https://images.pexels.com/photos/2159/flight-sky-earth-space.jpg?w=400', '11111111-1111-1111-1111-111111111111'),
  ('Family Todo App', 'Keep track of chores and tasks together', 'app', 'https://images.pexels.com/photos/3299/postit-scrabble-to-do.jpg?w=400', '22222222-2222-2222-2222-222222222222'),
  ('The Dragon Story', 'A magical tale about friendship and courage', 'story', 'https://images.pexels.com/photos/1766604/pexels-photo-1766604.jpeg?w=400', '33333333-3333-3333-3333-333333333333'),
  ('Rainbow Drawing', 'Colorful art created with digital brushes', 'art', 'https://images.pexels.com/photos/1209843/pexels-photo-1209843.jpeg?w=400', '44444444-4444-4444-4444-444444444444'),
  ('Maze Runner', 'Navigate through challenging mazes', 'game', 'https://images.pexels.com/photos/262103/pexels-photo-262103.jpeg?w=400', '33333333-3333-3333-3333-333333333333'),
  ('Weather Dashboard', 'Track weather for your location', 'app', 'https://images.pexels.com/photos/209831/pexels-photo-209831.jpeg?w=400', '11111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

-- 3. CREATE PROJECT TEMPLATES
INSERT INTO project_templates (title, description, type, thumbnail_url, template_data) VALUES
  ('Platformer Game', 'Jump and run through exciting levels', 'game', 'https://images.pexels.com/photos/371924/pexels-photo-371924.jpeg?w=400', '{"features": ["jumping", "enemies", "coins"]}'::jsonb),
  ('Quiz App', 'Create fun quizzes for family and friends', 'app', 'https://images.pexels.com/photos/5905857/pexels-photo-5905857.jpeg?w=400', '{"features": ["questions", "score", "timer"]}'::jsonb),
  ('Adventure Story', 'Choose your own adventure', 'story', 'https://images.pexels.com/photos/1742370/pexels-photo-1742370.jpeg?w=400', '{"features": ["chapters", "choices", "endings"]}'::jsonb),
  ('Pixel Art', 'Create retro-style pixel artwork', 'art', 'https://images.pexels.com/photos/159266/art-abstract-painting-oil-159266.jpeg?w=400', '{"features": ["grid", "colors", "export"]}'::jsonb),
  ('Racing Game', 'Speed through tracks and beat records', 'game', 'https://images.pexels.com/photos/210182/pexels-photo-210182.jpeg?w=400', '{"features": ["cars", "tracks", "multiplayer"]}'::jsonb),
  ('Drawing App', 'Digital canvas for creative art', 'art', 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?w=400', '{"features": ["brushes", "layers", "save"]}'::jsonb)
ON CONFLICT DO NOTHING;

-- 4. CREATE TOOLKIT CATEGORIES
INSERT INTO toolkit_categories (name, icon, color, sort_order) VALUES
  ('Art & Drawing', '🎨', '#ec4899', 1),
  ('Game Making', '🎮', '#8b5cf6', 2),
  ('Coding', '💻', '#3b82f6', 3),
  ('Music & Sound', '🎵', '#10b981', 4),
  ('Video & Animation', '🎬', '#f59e0b', 5),
  ('Writing', '✍️', '#ef4444', 6),
  ('Learning', '📚', '#06b6d4', 7)
ON CONFLICT DO NOTHING;

-- 5. CREATE TOOLKIT ITEMS
INSERT INTO toolkit_items (category_id, name, description, url, is_embeddable, embed_type)
SELECT
  c.id,
  t.name,
  t.description,
  t.url,
  t.is_embeddable,
  t.embed_type
FROM toolkit_categories c
CROSS JOIN (
  VALUES
    ('Art & Drawing', 'Piskel', 'Create pixel art and sprites', 'https://www.piskelapp.com/', true, 'external'),
    ('Art & Drawing', 'Tinkercad', '3D design and modeling', 'https://www.tinkercad.com/', true, 'external'),
    ('Game Making', 'Scratch', 'Block-based game creation', 'https://scratch.mit.edu/', true, 'external'),
    ('Game Making', 'MakeCode Arcade', 'Create retro arcade games', 'https://arcade.makecode.com/', true, 'external'),
    ('Coding', 'Code.org', 'Learn to code with tutorials', 'https://code.org/', true, 'external'),
    ('Coding', 'Replit', 'Code in any language online', 'https://replit.com/', true, 'external'),
    ('Music & Sound', 'Soundtrap', 'Create music online', 'https://www.soundtrap.com/', false, 'external'),
    ('Music & Sound', 'Chrome Music Lab', 'Explore music concepts', 'https://musiclab.chromeexperiments.com/', true, 'external'),
    ('Video & Animation', 'Kapwing', 'Edit videos and create animations', 'https://www.kapwing.com/', false, 'external'),
    ('Writing', 'Storybird', 'Write and illustrate stories', 'https://www.storybird.com/', false, 'external'),
    ('Learning', 'Khan Academy', 'Learn anything for free', 'https://www.khanacademy.org/', true, 'external')
) AS t(category_name, name, description, url, is_embeddable, embed_type)
WHERE c.name = t.category_name
ON CONFLICT DO NOTHING;

-- 6. CREATE CHAT THREADS
INSERT INTO chat_threads (name, description, icon, color, type, created_by) VALUES
  ('General', 'Family chat for everything', '💬', '#6b7280', 'general', 'Jacob'),
  ('Projects', 'Discuss creative projects', '🎨', '#ec4899', 'topic', 'Abby'),
  ('Games', 'Talk about games and ideas', '🎮', '#8b5cf6', 'topic', 'Ben'),
  ('Learning', 'Share what you learned', '📚', '#06b6d4', 'topic', 'Jacob')
ON CONFLICT DO NOTHING;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE toolkit_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE toolkit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;

-- Show summary
SELECT
  'Profiles' as table_name,
  COUNT(*) as count
FROM profiles
UNION ALL
SELECT 'Projects', COUNT(*) FROM projects
UNION ALL
SELECT 'Templates', COUNT(*) FROM project_templates
UNION ALL
SELECT 'Categories', COUNT(*) FROM toolkit_categories
UNION ALL
SELECT 'Tools', COUNT(*) FROM toolkit_items
UNION ALL
SELECT 'Threads', COUNT(*) FROM chat_threads
ORDER BY table_name;
