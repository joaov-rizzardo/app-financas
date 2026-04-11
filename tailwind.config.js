/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './index.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Brand colors
        primary: {
          DEFAULT: '#7c3aed',   // violet-600
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
        accent: {
          DEFAULT: '#06b6d4',   // cyan-500
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
        },
        // Dark background tokens
        background: {
          DEFAULT: '#0f0f14',
          surface: '#17171f',
          elevated: '#1e1e2a',
          card: '#232334',
        },
        // Text tokens
        text: {
          primary: '#f4f4f8',
          secondary: '#a0a0b8',
          muted: '#5c5c78',
          inverse: '#0f0f14',
        },
        // Status colors
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
        // Border
        border: {
          DEFAULT: '#2a2a3d',
          subtle: '#1e1e2a',
        },
      },
      fontFamily: {
        sans: ['Inter_400Regular', 'System'],
        medium: ['Inter_500Medium', 'System'],
        semibold: ['Inter_600SemiBold', 'System'],
        bold: ['Inter_700Bold', 'System'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};
