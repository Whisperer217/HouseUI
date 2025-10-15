import { supabase } from '../lib/supabase';
import { themes, Theme } from '../types/theme';

class ThemeService {
  private currentTheme: Theme = themes.dark;

  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  getThemeById(themeId: string): Theme {
    return themes[themeId] || themes.dark;
  }

  getAllThemes(): Theme[] {
    return Object.values(themes);
  }

  async loadUserTheme(userId: string): Promise<Theme> {
    try {
      const { data, error } = await supabase
        .from('family_profiles')
        .select('preferences')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      const themeId = data?.preferences?.theme || 'dark';
      this.currentTheme = this.getThemeById(themeId);
      return this.currentTheme;
    } catch (error) {
      console.error('Error loading theme:', error);
      this.currentTheme = themes.dark;
      return this.currentTheme;
    }
  }

  async saveUserTheme(userId: string, themeId: string): Promise<void> {
    try {
      const { data: existingData } = await supabase
        .from('family_profiles')
        .select('preferences')
        .eq('id', userId)
        .maybeSingle();

      const preferences = existingData?.preferences || {};
      preferences.theme = themeId;

      const { error } = await supabase
        .from('family_profiles')
        .update({ preferences })
        .eq('id', userId);

      if (error) throw error;

      this.currentTheme = this.getThemeById(themeId);
    } catch (error) {
      console.error('Error saving theme:', error);
      throw error;
    }
  }

  setTheme(themeId: string) {
    this.currentTheme = this.getThemeById(themeId);
  }
}

export const themeService = new ThemeService();
