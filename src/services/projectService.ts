import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export const projectService = {
  // Get all projects with creator info
  async getAllProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:created_by (
          id,
          name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get projects by type
  async getProjectsByType(type: 'game' | 'app' | 'story' | 'art') {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:created_by (
          id,
          name,
          avatar_url
        )
      `)
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get projects by creator
  async getProjectsByCreator(creatorId: string) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:created_by (
          id,
          name,
          avatar_url
        )
      `)
      .eq('created_by', creatorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get single project
  async getProject(id: string) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:created_by (
          id,
          name,
          avatar_url
        ),
        project_files (*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Create new project
  async createProject(project: ProjectInsert) {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select(`
        *,
        profiles:created_by (
          id,
          name,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Update project
  async updateProject(id: string, updates: ProjectUpdate) {
    const { data, error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        profiles:created_by (
          id,
          name,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Delete project
  async deleteProject(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get all profiles
  async getAllProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  },

  // Get profile by ID
  async getProfile(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },
};
