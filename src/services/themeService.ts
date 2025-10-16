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

  loadUserTheme(userId: string): Theme {
    try {
      const savedTheme = localStorage.getItem(`user_theme_${userId}`);
      const themeId = savedTheme || 'dark';
      this.currentTheme = this.getThemeById(themeId);
      return this.currentTheme;
    } catch (error) {
      console.error('Error loading theme:', error);
      this.currentTheme = themes.dark;
      return this.currentTheme;
    }
  }

  saveUserTheme(userId: string, themeId: string): void {
    try {
      localStorage.setItem(`user_theme_${userId}`, themeId);
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
