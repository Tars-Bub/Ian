import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setUserThemePreference = (userId: string, preferredTheme: Theme) => {
    try {
      const userPrefs = JSON.parse(localStorage.getItem('userThemePreferences') || '{}');
      userPrefs[userId] = preferredTheme;
      localStorage.setItem('userThemePreferences', JSON.stringify(userPrefs));
    } catch (error) {
      console.error('Error saving user theme preference:', error);
    }
  };

  const getUserThemePreference = (userId: string): Theme | null => {
    try {
      const userPrefs = JSON.parse(localStorage.getItem('userThemePreferences') || '{}');
      return userPrefs[userId] || null;
    } catch (error) {
      console.error('Error getting user theme preference:', error);
      return null;
    }
  };

  return { theme, toggleTheme, setUserThemePreference, getUserThemePreference };
}