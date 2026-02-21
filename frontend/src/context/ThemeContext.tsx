import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface ThemeColors {
  background?: string;
  backgroundSecondary?: string;
  card?: string;
  accent?: string;
  accentHover?: string;
  textPrimary?: string;
  textSecondary?: string;
  textMuted?: string;
  border?: string;
}

export interface ThemeFontSize {
  base?: string;
  sm?: string;
  lg?: string;
}

export interface ThemeConfig {
  colors?: ThemeColors;
  borderRadius?: string;
  fontSize?: ThemeFontSize;
}

interface ThemeContextValue {
  theme: ThemeConfig | null;
  applyTheme: (config: ThemeConfig) => void;
  resetTheme: () => void;
  isCustomized: boolean;
}

const STORAGE_KEY = 'f1tm_custom_theme';

const CSS_VAR_MAP: Record<string, string> = {
  background: '--color-bg',
  backgroundSecondary: '--color-bg-secondary',
  card: '--color-card',
  accent: '--color-accent',
  accentHover: '--color-accent-hover',
  textPrimary: '--color-text-primary',
  textSecondary: '--color-text-secondary',
  textMuted: '--color-text-muted',
  border: '--color-border',
};

const FONT_SIZE_VAR_MAP: Record<string, string> = {
  base: '--font-base',
  sm: '--font-sm',
  lg: '--font-lg',
};

const ALL_CUSTOM_VARS = [
  ...Object.values(CSS_VAR_MAP),
  ...Object.values(FONT_SIZE_VAR_MAP),
  '--radius-md',
];

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyCSSVariables(config: ThemeConfig) {
  const root = document.documentElement;

  if (config.colors) {
    for (const [key, value] of Object.entries(config.colors)) {
      const cssVar = CSS_VAR_MAP[key];
      if (cssVar && value) {
        root.style.setProperty(cssVar, value);
      }
    }
  }

  if (config.borderRadius) {
    root.style.setProperty('--radius-md', config.borderRadius);
  }

  if (config.fontSize) {
    for (const [key, value] of Object.entries(config.fontSize)) {
      const cssVar = FONT_SIZE_VAR_MAP[key];
      if (cssVar && value) {
        root.style.setProperty(cssVar, value);
      }
    }
  }
}

function removeCSSVariables() {
  const root = document.documentElement;
  for (const cssVar of ALL_CUSTOM_VARS) {
    root.style.removeProperty(cssVar);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Apply theme on mount
  useEffect(() => {
    if (theme) {
      applyCSSVariables(theme);
    }
  }, []);

  const applyTheme = useCallback((config: ThemeConfig) => {
    // Merge with existing theme
    const merged: ThemeConfig = {
      ...theme,
      ...config,
      colors: { ...theme?.colors, ...config.colors },
      fontSize: { ...theme?.fontSize, ...config.fontSize },
    };
    setTheme(merged);
    applyCSSVariables(merged);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  }, [theme]);

  const resetTheme = useCallback(() => {
    setTheme(null);
    removeCSSVariables();
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, applyTheme, resetTheme, isCustomized: theme !== null }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
