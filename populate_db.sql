-- Populate Family Creative Platform with Initial Data

-- 1. Create Family Profiles
INSERT INTO profiles (id, name, avatar_url, preferences) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Jacob', '👨', '{"theme": "dark"}'::jsonb),
  ('22222222-2222-2222-2222-222222222222', 'Abby', '👧', '{"theme": "unicorn"}'::jsonb),
  ('33333333-3333-3333-3333-333333333333', 'Ben', '👦', '{"theme": "forest"}'::jsonb),
  ('44444444-4444-4444-4444-444444444444', 'Rox', '🐕', '{"theme": "sunset"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 2. Create Sample Projects
INSERT INTO projects (id, title, description, type, thumbnail_url, created_by) VALUES
  (gen_random_uuid(), 'Space Adventure Game', 'Explore the galaxy and discover new planets', 'game', 'https://images.pexels.com/photos/2159/flight-sky-earth-space.jpg', '11111111-1111-1111-1111-111111111111'),
  (gen_random_uuid(), 'Family Todo App', 'Keep track of chores and tasks together', 'app', 'https://images.pexels.com/photos/3299/postit-scrabble-to-do.jpg', '22222222-2222-2222-2222-222222222222'),
  (gen_random_uuid(), 'The Dragon Story', 'A magical tale about friendship and courage', 'story', 'https://images.pexels.com/photos/1766604/pexels-photo-1766604.jpeg', '33333333-3333-3333-3333-333333333333'),
  (gen_random_uuid(), 'Rainbow Drawing', 'Colorful art created with digital brushes', 'art', 'https://images.pexels.com/photos/1209843/pexels-photo-1209843.jpeg', '44444444-4444-4444-4444-444444444444')
ON CONFLICT DO NOTHING;

-- 3. Create Project Templates
INSERT INTO project_templates (id, title, description, type, thumbnail_url, template_data) VALUES
  (gen_random_uuid(), 'Platformer Game', 'Jump and run through exciting levels', 'game', 'https://images.pexels.com/photos/371924/pexels-photo-371924.jpeg', '{"features": ["jumping", "enemies", "coins"]}'::jsonb),
  (gen_random_uuid(), 'Quiz App', 'Create fun quizzes for family and friends', 'app', 'https://images.pexels.com/photos/5905857/pexels-photo-5905857.jpeg', '{"features": ["questions", "score", "timer"]}'::jsonb),
  (gen_random_uuid(), 'Adventure Story', 'Choose your own adventure story template', 'story', 'https://images.pexels.com/photos/1742370/pexels-photo-1742370.jpeg', '{"features": ["chapters", "choices", "endings"]}'::jsonb),
  (gen_random_uuid(), 'Pixel Art', 'Create retro-style pixel artwork', 'art', 'https://images.pexels.com/photos/159266/art-abstract-painting-oil-159266.jpeg', '{"features": ["grid", "colors", "export"]}'::jsonb)
ON CONFLICT DO NOTHING;

-- 4. Create Toolkit Categories
INSERT INTO toolkit_categories (id, name, icon, color, sort_order) VALUES
  (gen_random_uuid(), 'Art & Drawing', '🎨', '#ec4899', 1),
  (gen_random_uuid(), 'Game Making', '🎮', '#8b5cf6', 2),
  (gen_random_uuid(), 'Coding', '💻', '#3b82f6', 3),
  (gen_random_uuid(), 'Music & Sound', '🎵', '#10b981', 4),
  (gen_random_uuid(), 'Video & Animation', '🎬', '#f59e0b', 5),
  (gen_random_uuid(), 'Writing', '✍️', '#ef4444', 6),
  (gen_random_uuid(), 'Learning', '📚', '#06b6d4', 7)
ON CONFLICT DO NOTHING;

-- 5. Create Sample Toolkit Items
WITH categories AS (
  SELECT id, name FROM toolkit_categories
)
INSERT INTO toolkit_items (category_id, name, description, url, is_embeddable, embed_type)
SELECT
  c.id,
  item.name,
  item.description,
  item.url,
  item.is_embeddable,
  item.embed_type
FROM categories c
CROSS JOIN LATERAL (
  VALUES
    ('Piskel', 'Create pixel art and sprites', 'https://www.piskelapp.com/', true, 'external'),
    ('Scratch', 'Block-based coding for games', 'https://scratch.mit.edu/', true, 'external'),
    ('Tinkercad', '3D design and modeling', 'https://www.tinkercad.com/', true, 'external')
) AS item(name, description, url, is_embeddable, embed_type)
WHERE c.name IN ('Art & Drawing', 'Game Making', 'Coding')
LIMIT 3;

-- 6. Create Sample Chat Threads
INSERT INTO chat_threads (id, name, description, icon, color, type, created_by) VALUES
  (gen_random_uuid(), 'General', 'Family chat for everything', '💬', '#6b7280', 'general', 'Jacob'),
  (gen_random_uuid(), 'Projects', 'Discuss your creative projects', '🎨', '#ec4899', 'topic', 'Abby'),
  (gen_random_uuid(), 'Games', 'Talk about games and ideas', '🎮', '#8b5cf6', 'topic', 'Ben')
ON CONFLICT DO NOTHING;

-- Print summary
SELECT
  (SELECT COUNT(*) FROM profiles) as profiles,
  (SELECT COUNT(*) FROM projects) as projects,
  (SELECT COUNT(*) FROM project_templates) as templates,
  (SELECT COUNT(*) FROM toolkit_categories) as categories,
  (SELECT COUNT(*) FROM toolkit_items) as tools,
  (SELECT COUNT(*) FROM chat_threads) as threads;
