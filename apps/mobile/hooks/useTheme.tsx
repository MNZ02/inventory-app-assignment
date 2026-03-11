import { useEffect, useState, createContext, useContext } from 'react';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = 'app_theme_preference';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeContextType {
  themePreference: ThemePreference;
  colorScheme: 'light' | 'dark' | undefined;
  cycleTheme: () => Promise<void>;
  isInitialized: boolean;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme } = useNativeWindColorScheme();
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function loadTheme() {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY) as ThemePreference | null;
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setThemePreference(stored);
          setColorScheme(stored);
        } else {
          setThemePreference('system');
          setColorScheme('system');
          await AsyncStorage.setItem(THEME_STORAGE_KEY, 'system');
        }
      } catch (e) {
        console.error('Failed to load theme preference', e);
      } finally {
        setIsInitialized(true);
      }
    }
    loadTheme();
  }, [setColorScheme]);

  const cycleTheme = async () => {
    try {
      let nextTheme: ThemePreference = 'system';
      if (themePreference === 'light') nextTheme = 'dark';
      else if (themePreference === 'dark') nextTheme = 'system';
      else if (themePreference === 'system') nextTheme = 'light';

      setThemePreference(nextTheme);
      setColorScheme(nextTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch (e) {
      console.error('Failed to save theme preference', e);
    }
  };

  return (
    <ThemeContext.Provider value={{ themePreference, colorScheme: colorScheme as 'light' | 'dark' | undefined, cycleTheme, isInitialized }}>
      {children}
    </ThemeContext.Provider>
  );
}
