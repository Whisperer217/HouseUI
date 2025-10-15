import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://urqddoybmgbtimbqszti.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycWRkb3libWdidGltYnFzenRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MDQwMzEsImV4cCI6MjA3NjA4MDAzMX0.jOLF-OfSI4An5S40mXPp9oyrphCYp6LRYv8ghfXpcPw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateDatabase() {
  console.log('🚀 Starting database population...\n');

  try {
    // 1. Create Family Profiles
    console.log('👥 Creating family profiles...');
    const profiles = [
      { id: '11111111-1111-1111-1111-111111111111', name: 'Jacob', avatar_url: '👨', preferences: { theme: 'dark' } },
      { id: '22222222-2222-2222-2222-222222222222', name: 'Abby', avatar_url: '👧', preferences: { theme: 'unicorn' } },
      { id: '33333333-3333-3333-3333-333333333333', name: 'Ben', avatar_url: '👦', preferences: { theme: 'forest' } },
      { id: '44444444-4444-4444-4444-444444444444', name: 'Rox', avatar_url: '🐕', preferences: { theme: 'sunset' } }
    ];

    for (const profile of profiles) {
      const { error } = await supabase.from('profiles').upsert(profile);
      if (error) console.error('Error adding profile:', error.message);
      else console.log(`  ✓ Added ${profile.name}`);
    }

    // 2. Create Sample Projects
    console.log('\n📁 Creating sample projects...');
    const projects = [
      {
        title: 'Space Adventure Game',
        description: 'Explore the galaxy and discover new planets',
        type: 'game',
        thumbnail_url: 'https://images.pexels.com/photos/2159/flight-sky-earth-space.jpg',
        created_by: '11111111-1111-1111-1111-111111111111'
      },
      {
        title: 'Family Todo App',
        description: 'Keep track of chores and tasks together',
        type: 'app',
        thumbnail_url: 'https://images.pexels.com/photos/3299/postit-scrabble-to-do.jpg',
        created_by: '22222222-2222-2222-2222-222222222222'
      },
      {
        title: 'The Dragon Story',
        description: 'A magical tale about friendship and courage',
        type: 'story',
        thumbnail_url: 'https://images.pexels.com/photos/1766604/pexels-photo-1766604.jpeg',
        created_by: '33333333-3333-3333-3333-333333333333'
      },
      {
        title: 'Rainbow Drawing',
        description: 'Colorful art created with digital brushes',
        type: 'art',
        thumbnail_url: 'https://images.pexels.com/photos/1209843/pexels-photo-1209843.jpeg',
        created_by: '44444444-4444-4444-4444-444444444444'
      }
    ];

    for (const project of projects) {
      const { error } = await supabase.from('projects').insert(project);
      if (error) console.error('Error adding project:', error.message);
      else console.log(`  ✓ Added ${project.title}`);
    }

    // 3. Create Project Templates
    console.log('\n📋 Creating project templates...');
    const templates = [
      {
        title: 'Platformer Game',
        description: 'Jump and run through exciting levels',
        type: 'game',
        thumbnail_url: 'https://images.pexels.com/photos/371924/pexels-photo-371924.jpeg',
        template_data: { features: ['jumping', 'enemies', 'coins'] }
      },
      {
        title: 'Quiz App',
        description: 'Create fun quizzes for family and friends',
        type: 'app',
        thumbnail_url: 'https://images.pexels.com/photos/5905857/pexels-photo-5905857.jpeg',
        template_data: { features: ['questions', 'score', 'timer'] }
      },
      {
        title: 'Adventure Story',
        description: 'Choose your own adventure story template',
        type: 'story',
        thumbnail_url: 'https://images.pexels.com/photos/1742370/pexels-photo-1742370.jpeg',
        template_data: { features: ['chapters', 'choices', 'endings'] }
      },
      {
        title: 'Pixel Art',
        description: 'Create retro-style pixel artwork',
        type: 'art',
        thumbnail_url: 'https://images.pexels.com/photos/159266/art-abstract-painting-oil-159266.jpeg',
        template_data: { features: ['grid', 'colors', 'export'] }
      }
    ];

    for (const template of templates) {
      const { error } = await supabase.from('project_templates').insert(template);
      if (error) console.error('Error adding template:', error.message);
      else console.log(`  ✓ Added ${template.title}`);
    }

    // 4. Create Toolkit Categories
    console.log('\n🛠️ Creating toolkit categories...');
    const categories = [
      { name: 'Art & Drawing', icon: '🎨', color: '#ec4899', sort_order: 1 },
      { name: 'Game Making', icon: '🎮', color: '#8b5cf6', sort_order: 2 },
      { name: 'Coding', icon: '💻', color: '#3b82f6', sort_order: 3 },
      { name: 'Music & Sound', icon: '🎵', color: '#10b981', sort_order: 4 },
      { name: 'Video & Animation', icon: '🎬', color: '#f59e0b', sort_order: 5 },
      { name: 'Writing', icon: '✍️', color: '#ef4444', sort_order: 6 },
      { name: 'Learning', icon: '📚', color: '#06b6d4', sort_order: 7 }
    ];

    const categoryIds = {};
    for (const category of categories) {
      const { data, error } = await supabase.from('toolkit_categories').insert(category).select();
      if (error) console.error('Error adding category:', error.message);
      else {
        console.log(`  ✓ Added ${category.name}`);
        if (data && data[0]) categoryIds[category.name] = data[0].id;
      }
    }

    // 5. Create Sample Toolkit Items
    console.log('\n🔧 Creating toolkit items...');
    const tools = [
      {
        category: 'Art & Drawing',
        name: 'Piskel',
        description: 'Create pixel art and sprites',
        url: 'https://www.piskelapp.com/',
        is_embeddable: true,
        embed_type: 'external'
      },
      {
        category: 'Game Making',
        name: 'Scratch',
        description: 'Block-based coding for games',
        url: 'https://scratch.mit.edu/',
        is_embeddable: true,
        embed_type: 'external'
      },
      {
        category: 'Coding',
        name: 'Code.org',
        description: 'Learn to code with fun tutorials',
        url: 'https://code.org/',
        is_embeddable: true,
        embed_type: 'external'
      },
      {
        category: 'Music & Sound',
        name: 'Soundtrap',
        description: 'Create music online',
        url: 'https://www.soundtrap.com/',
        is_embeddable: false,
        embed_type: 'external'
      },
      {
        category: 'Video & Animation',
        name: 'Kapwing',
        description: 'Edit videos and create animations',
        url: 'https://www.kapwing.com/',
        is_embeddable: false,
        embed_type: 'external'
      },
      {
        category: 'Writing',
        name: 'Story Creator',
        description: 'Write and illustrate stories',
        url: 'https://www.storybird.com/',
        is_embeddable: false,
        embed_type: 'external'
      },
      {
        category: 'Learning',
        name: 'Khan Academy',
        description: 'Learn anything for free',
        url: 'https://www.khanacademy.org/',
        is_embeddable: true,
        embed_type: 'external'
      }
    ];

    for (const tool of tools) {
      const categoryId = categoryIds[tool.category];
      if (!categoryId) continue;

      const { error } = await supabase.from('toolkit_items').insert({
        category_id: categoryId,
        name: tool.name,
        description: tool.description,
        url: tool.url,
        is_embeddable: tool.is_embeddable,
        embed_type: tool.embed_type
      });
      if (error) console.error('Error adding tool:', error.message);
      else console.log(`  ✓ Added ${tool.name}`);
    }

    // 6. Create Sample Chat Threads
    console.log('\n💬 Creating chat threads...');
    const threads = [
      { name: 'General', description: 'Family chat for everything', icon: '💬', color: '#6b7280', type: 'general', created_by: 'Jacob' },
      { name: 'Projects', description: 'Discuss your creative projects', icon: '🎨', color: '#ec4899', type: 'topic', created_by: 'Abby' },
      { name: 'Games', description: 'Talk about games and ideas', icon: '🎮', color: '#8b5cf6', type: 'topic', created_by: 'Ben' }
    ];

    for (const thread of threads) {
      const { error } = await supabase.from('chat_threads').insert(thread);
      if (error) console.error('Error adding thread:', error.message);
      else console.log(`  ✓ Added ${thread.name}`);
    }

    // Summary
    console.log('\n📊 Database Summary:');
    const { data: profileCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { data: projectCount } = await supabase.from('projects').select('*', { count: 'exact', head: true });
    const { data: templateCount } = await supabase.from('project_templates').select('*', { count: 'exact', head: true });
    const { data: categoryCount } = await supabase.from('toolkit_categories').select('*', { count: 'exact', head: true });
    const { data: toolCount } = await supabase.from('toolkit_items').select('*', { count: 'exact', head: true });
    const { data: threadCount } = await supabase.from('chat_threads').select('*', { count: 'exact', head: true });

    console.log(`  Profiles: ${profileCount?.length || 0}`);
    console.log(`  Projects: ${projectCount?.length || 0}`);
    console.log(`  Templates: ${templateCount?.length || 0}`);
    console.log(`  Categories: ${categoryCount?.length || 0}`);
    console.log(`  Tools: ${toolCount?.length || 0}`);
    console.log(`  Threads: ${threadCount?.length || 0}`);

    console.log('\n✅ Database populated successfully!');
    console.log('\n🌐 Refresh your app at http://localhost:5173 to see the data!');

  } catch (error) {
    console.error('\n❌ Error populating database:', error);
  }
}

populateDatabase();
