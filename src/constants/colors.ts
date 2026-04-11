/**
 * Design tokens — single source of truth for the color palette.
 * All values mirror the Tailwind config in tailwind.config.js.
 */

export const colors = {
  // Brand — Violet (primary accent)
  primary: {
    DEFAULT: '#7c3aed',
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },

  // Brand — Cyan (secondary accent)
  accent: {
    DEFAULT: '#06b6d4',
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
  },

  // Dark backgrounds
  background: {
    DEFAULT: '#0f0f14',   // app bg
    surface: '#17171f',   // cards / panels background
    elevated: '#1e1e2a',  // modals, dropdowns
    card: '#232334',      // inner card elements
  },

  // Text hierarchy
  text: {
    primary: '#f4f4f8',
    secondary: '#a0a0b8',
    muted: '#5c5c78',
    inverse: '#0f0f14',
  },

  // Semantic
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',

  // Borders
  border: {
    DEFAULT: '#2a2a3d',
    subtle: '#1e1e2a',
  },
} as const;

export type ColorToken = typeof colors;
