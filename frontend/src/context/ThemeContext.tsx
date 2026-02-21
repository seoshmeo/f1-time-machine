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
const STYLE_ID = 'f1tm-custom-theme';

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

const ThemeContext = createContext<ThemeContextValue | null>(null);

function buildStyleSheet(config: ThemeConfig): string {
  const rules: string[] = [];
  const c = config.colors || {};

  // 1. Override CSS variables on :root (for anything using var())
  const varOverrides: string[] = [];
  for (const [key, cssVar] of Object.entries(CSS_VAR_MAP)) {
    const val = c[key as keyof ThemeColors];
    if (val) varOverrides.push(`  ${cssVar}: ${val};`);
  }
  if (config.borderRadius) {
    varOverrides.push(`  --radius-sm: ${config.borderRadius};`);
    varOverrides.push(`  --radius-md: ${config.borderRadius};`);
    varOverrides.push(`  --radius-lg: ${config.borderRadius};`);
  }
  if (config.fontSize) {
    if (config.fontSize.base) varOverrides.push(`  --font-base: ${config.fontSize.base};`);
    if (config.fontSize.sm) varOverrides.push(`  --font-sm: ${config.fontSize.sm};`);
    if (config.fontSize.lg) varOverrides.push(`  --font-lg: ${config.fontSize.lg};`);
  }
  if (varOverrides.length > 0) {
    rules.push(`:root {\n${varOverrides.join('\n')}\n}`);
  }

  // 2. Force-override inline styles via !important on semantic/structural selectors
  // This beats React inline styles which use element.style.*

  if (c.background) {
    rules.push(`
body,
#root > div,
#root > div > main {
  background-color: ${c.background} !important;
}`);
  }

  if (c.backgroundSecondary) {
    rules.push(`
header,
footer,
header > div,
nav[style] {
  background-color: ${c.backgroundSecondary} !important;
}`);
  }

  if (c.card) {
    rules.push(`
.card,
.card:hover {
  background-color: ${c.card} !important;
}`);
  }

  if (c.accent) {
    rules.push(`
.badge-accent,
.btn-primary {
  background-color: ${c.accent} !important;
}
a {
  color: ${c.accent};
}
::selection {
  background-color: ${c.accent};
}`);
  }

  if (c.accentHover) {
    rules.push(`
a:hover {
  color: ${c.accentHover};
}
.btn-primary:hover:not(:disabled) {
  background-color: ${c.accentHover} !important;
}`);
  }

  if (c.textPrimary) {
    rules.push(`
body {
  color: ${c.textPrimary} !important;
}
h1, h2, h3, h4, h5, h6 {
  color: ${c.textPrimary} !important;
}`);
  }

  if (c.border) {
    rules.push(`
.card {
  border-color: ${c.border} !important;
}
thead {
  border-bottom-color: ${c.border} !important;
}
td {
  border-bottom-color: ${c.border} !important;
}
header {
  border-bottom-color: ${c.border} !important;
}
footer {
  border-top-color: ${c.border} !important;
}`);
  }

  if (config.fontSize?.base) {
    rules.push(`html { font-size: ${config.fontSize.base} !important; }`);
  }

  return rules.join('\n');
}

function injectStyleSheet(config: ThemeConfig) {
  let el = document.getElementById(STYLE_ID);
  if (!el) {
    el = document.createElement('style');
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = buildStyleSheet(config);
}

function removeStyleSheet() {
  const el = document.getElementById(STYLE_ID);
  if (el) el.remove();
}

// Force-apply theme to elements with inline styles by directly mutating their style
function forceApplyToInlineElements(config: ThemeConfig) {
  const c = config.colors;
  if (!c) return;

  // Map of rgb values to new colors
  const bgMap: [string, string][] = [];
  if (c.background) bgMap.push(['rgb(15, 15, 15)', c.background]);
  if (c.backgroundSecondary) {
    bgMap.push(['rgb(26, 26, 46)', c.backgroundSecondary]);
  }
  if (c.accent) bgMap.push(['rgb(225, 6, 0)', c.accent]);

  const colorMap: [string, string][] = [];
  if (c.textPrimary) colorMap.push(['rgb(255, 255, 255)', c.textPrimary]);
  if (c.textSecondary) colorMap.push(['rgb(176, 176, 176)', c.textSecondary]);
  if (c.textMuted) {
    colorMap.push(['rgb(112, 112, 112)', c.textMuted]);
    colorMap.push(['rgb(102, 102, 102)', c.textMuted]); // #666
    colorMap.push(['rgb(85, 85, 85)', c.textMuted]);     // #555
  }

  const borderMap: [string, string][] = [];
  if (c.border) borderMap.push(['rgb(42, 42, 62)', c.border]);

  // Walk all elements with inline styles
  const allStyled = document.querySelectorAll('[style]');
  allStyled.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const computedBg = htmlEl.style.backgroundColor;
    const computedColor = htmlEl.style.color;
    const computedBorderColor = htmlEl.style.borderColor;
    const computedBorderBottom = htmlEl.style.borderBottom;
    const computedBorderTop = htmlEl.style.borderTop;
    const computedBorderLeft = htmlEl.style.borderLeft;

    for (const [oldRgb, newColor] of bgMap) {
      if (computedBg === oldRgb) {
        htmlEl.style.backgroundColor = newColor;
        break;
      }
    }

    for (const [oldRgb, newColor] of colorMap) {
      if (computedColor === oldRgb) {
        htmlEl.style.color = newColor;
        break;
      }
    }

    for (const [oldRgb, newColor] of borderMap) {
      if (computedBorderColor === oldRgb) {
        htmlEl.style.borderColor = newColor;
      }
      if (computedBorderBottom.includes(oldRgb)) {
        htmlEl.style.borderBottomColor = newColor;
      }
      if (computedBorderTop.includes(oldRgb)) {
        htmlEl.style.borderTopColor = newColor;
      }
      if (computedBorderLeft.includes(oldRgb)) {
        htmlEl.style.borderLeftColor = newColor;
      }
    }
  });
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

  // Apply on mount + observe DOM mutations to catch new elements
  useEffect(() => {
    if (!theme) return;

    injectStyleSheet(theme);
    // Delay to let React render first
    const timer = setTimeout(() => forceApplyToInlineElements(theme), 100);

    // Re-apply when DOM changes (new components mount)
    const observer = new MutationObserver(() => {
      forceApplyToInlineElements(theme);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [theme]);

  const applyTheme = useCallback((config: ThemeConfig) => {
    const merged: ThemeConfig = {
      ...theme,
      ...config,
      colors: { ...theme?.colors, ...config.colors },
      fontSize: { ...theme?.fontSize, ...config.fontSize },
    };
    setTheme(merged);
    injectStyleSheet(merged);
    setTimeout(() => forceApplyToInlineElements(merged), 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  }, [theme]);

  const resetTheme = useCallback(() => {
    setTheme(null);
    removeStyleSheet();
    localStorage.removeItem(STORAGE_KEY);
    // Force reload to restore original inline styles
    window.location.reload();
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
