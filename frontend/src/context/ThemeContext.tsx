import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';

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

export interface ThemeLayout {
  maxWidth?: string;
  contentPadding?: string;
  cardColumns?: string;
  cardMinWidth?: string;
  cardPadding?: string;
  cardScale?: string;
  gap?: string;
  headerPosition?: 'sticky' | 'static';
}

export interface ReorderRule {
  match: string;
  order: number;
}

export interface ThemeConfig {
  colors?: ThemeColors;
  borderRadius?: string;
  fontSize?: ThemeFontSize;
  layout?: ThemeLayout;
  reorder?: ReorderRule[];
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
  const l = config.layout || {};

  // 1. Override CSS variables on :root
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

  // 2. Color overrides via !important on semantic selectors
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
.card, .card:hover {
  background-color: ${c.card} !important;
}`);
  }

  if (c.accent) {
    rules.push(`
.badge-accent, .btn-primary {
  background-color: ${c.accent} !important;
}
a { color: ${c.accent}; }
::selection { background-color: ${c.accent}; }`);
  }

  if (c.accentHover) {
    rules.push(`
a:hover { color: ${c.accentHover}; }
.btn-primary:hover:not(:disabled) {
  background-color: ${c.accentHover} !important;
}`);
  }

  if (c.textPrimary) {
    rules.push(`
body { color: ${c.textPrimary} !important; }
h1, h2, h3, h4, h5, h6 { color: ${c.textPrimary} !important; }`);
  }

  if (c.border) {
    rules.push(`
.card { border-color: ${c.border} !important; }
thead { border-bottom-color: ${c.border} !important; }
td { border-bottom-color: ${c.border} !important; }
header { border-bottom-color: ${c.border} !important; }
footer { border-top-color: ${c.border} !important; }`);
  }

  if (config.fontSize?.base) {
    rules.push(`html { font-size: ${config.fontSize.base} !important; }`);
  }

  // 3. Layout overrides
  if (l.maxWidth) {
    rules.push(`
[style*="max-width"] {
  max-width: ${l.maxWidth} !important;
}
.container, .container-wide {
  max-width: ${l.maxWidth} !important;
}`);
  }

  if (l.contentPadding) {
    rules.push(`
#root > div > main {
  padding: ${l.contentPadding} !important;
}
.container, .container-wide {
  padding-left: ${l.contentPadding} !important;
  padding-right: ${l.contentPadding} !important;
}`);
  }

  if (l.cardColumns) {
    rules.push(`
.grid-cols-2, .grid-cols-3, .grid-cols-4 {
  grid-template-columns: repeat(${l.cardColumns}, minmax(0, 1fr)) !important;
}
@media (max-width: 768px) {
  .grid-cols-2, .grid-cols-3, .grid-cols-4 {
    grid-template-columns: 1fr !important;
  }
}`);
  }

  // Card sizing: override minmax in auto-fill grids and card padding
  if (l.cardMinWidth) {
    rules.push(`
[style*="grid-template-columns"],
[style*="gridTemplateColumns"] {
  grid-template-columns: repeat(auto-fill, minmax(${l.cardMinWidth}, 1fr)) !important;
}`);
  }

  if (l.cardPadding) {
    rules.push(`
.card,
[style*="padding: 24px"],
[style*="padding: 32px"] {
  padding: ${l.cardPadding} !important;
}`);
  }

  if (l.cardScale) {
    const scale = parseFloat(l.cardScale);
    if (scale > 0 && scale <= 4) {
      rules.push(`
[style*="display: grid"] > *,
[style*="display:grid"] > *,
.grid > * {
  transform: scale(1) !important;
  font-size: ${scale}em !important;
}
[style*="display: grid"] > * h3,
[style*="display:grid"] > * h3,
.grid > * h3 {
  font-size: ${scale * 1.25}em !important;
}`);
    }
  }

  if (l.gap) {
    rules.push(`
.gap-md { gap: ${l.gap} !important; }
.gap-lg { gap: ${l.gap} !important; }
.grid { gap: ${l.gap} !important; }`);
  }

  if (l.headerPosition) {
    rules.push(`
header {
  position: ${l.headerPosition} !important;
}`);
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

// Force-apply theme to elements with inline styles by directly mutating their DOM style
function forceApplyToInlineElements(config: ThemeConfig) {
  const c = config.colors;
  if (!c) return;

  const bgMap: [string, string][] = [];
  if (c.background) bgMap.push(['rgb(15, 15, 15)', c.background]);
  if (c.backgroundSecondary) bgMap.push(['rgb(26, 26, 46)', c.backgroundSecondary]);
  if (c.accent) bgMap.push(['rgb(225, 6, 0)', c.accent]);

  const colorMap: [string, string][] = [];
  if (c.textPrimary) colorMap.push(['rgb(255, 255, 255)', c.textPrimary]);
  if (c.textSecondary) colorMap.push(['rgb(176, 176, 176)', c.textSecondary]);
  if (c.textMuted) {
    colorMap.push(['rgb(112, 112, 112)', c.textMuted]);
    colorMap.push(['rgb(102, 102, 102)', c.textMuted]);
    colorMap.push(['rgb(85, 85, 85)', c.textMuted]);
  }

  const borderMap: [string, string][] = [];
  if (c.border) borderMap.push(['rgb(42, 42, 62)', c.border]);

  const allStyled = document.querySelectorAll('[style]');
  allStyled.forEach((el) => {
    const h = el as HTMLElement;

    for (const [oldRgb, newColor] of bgMap) {
      if (h.style.backgroundColor === oldRgb) {
        h.style.backgroundColor = newColor;
        break;
      }
    }

    for (const [oldRgb, newColor] of colorMap) {
      if (h.style.color === oldRgb) {
        h.style.color = newColor;
        break;
      }
    }

    for (const [oldRgb, newColor] of borderMap) {
      if (h.style.borderColor === oldRgb) h.style.borderColor = newColor;
      if (h.style.borderBottom?.includes(oldRgb)) h.style.borderBottomColor = newColor;
      if (h.style.borderTop?.includes(oldRgb)) h.style.borderTopColor = newColor;
      if (h.style.borderLeft?.includes(oldRgb)) h.style.borderLeftColor = newColor;
    }
  });

  // Layout overrides on inline-styled elements
  const layout = config.layout;
  if (!layout) return;

  document.querySelectorAll('[style]').forEach((el) => {
    const h = el as HTMLElement;

    // Force maxWidth on containers
    if (layout.maxWidth && h.style.maxWidth && h.style.maxWidth !== '0px') {
      h.style.maxWidth = layout.maxWidth;
    }

    // Force grid template columns (cardMinWidth)
    if (layout.cardMinWidth && h.style.gridTemplateColumns &&
        h.style.gridTemplateColumns.includes('auto-fill')) {
      h.style.gridTemplateColumns = `repeat(auto-fill, minmax(${layout.cardMinWidth}, 1fr))`;
    }

    // Force card padding
    if (layout.cardPadding && h.style.padding &&
        (h.style.padding === '24px' || h.style.padding === '32px')) {
      h.style.padding = layout.cardPadding;
    }

    // Force gap on grids
    if (layout.gap && h.style.display === 'grid' && h.style.gap) {
      h.style.gap = layout.gap;
    }
  });

  // Apply reorder rules
  if (config.reorder && config.reorder.length > 0) {
    applyReorderRules(config.reorder);
  }
}

// Apply CSS order to grid/flex children matching text
function applyReorderRules(rules: ReorderRule[]) {
  if (!rules || rules.length === 0) return;

  // Find all grid and flex containers
  const containers = document.querySelectorAll('[style]');
  containers.forEach((container) => {
    const h = container as HTMLElement;
    const display = h.style.display;
    if (display !== 'grid' && display !== 'flex') return;

    // Check each child
    const children = h.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      const text = child.textContent || '';

      for (const rule of rules) {
        if (text.toLowerCase().includes(rule.match.toLowerCase())) {
          child.style.order = String(rule.order);
          break;
        }
      }
    }
  });
}

// Schedule force-apply after React render completes
function scheduleForceApply(config: ThemeConfig) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      forceApplyToInlineElements(config);
    });
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

  const themeRef = useRef(theme);
  themeRef.current = theme;

  // Apply on mount + observe DOM mutations to catch new elements
  useEffect(() => {
    if (!theme) return;

    injectStyleSheet(theme);
    scheduleForceApply(theme);

    // Debounced re-apply when DOM changes (new components mount)
    let rafId: number | null = null;
    const observer = new MutationObserver(() => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (themeRef.current) forceApplyToInlineElements(themeRef.current);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [theme]);

  const applyTheme = useCallback((config: ThemeConfig) => {
    const merged: ThemeConfig = {
      ...theme,
      ...config,
      colors: { ...theme?.colors, ...config.colors },
      fontSize: { ...theme?.fontSize, ...config.fontSize },
      layout: { ...theme?.layout, ...config.layout },
      reorder: config.reorder ?? theme?.reorder,
    };
    setTheme(merged);
    injectStyleSheet(merged);
    scheduleForceApply(merged);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  }, [theme]);

  const resetTheme = useCallback(() => {
    setTheme(null);
    removeStyleSheet();
    localStorage.removeItem(STORAGE_KEY);
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
