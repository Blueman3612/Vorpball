import type { Config } from "tailwindcss";
import { theme as customTheme } from "./src/lib/theme";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Success color classes for affirmative buttons
    'bg-success-500',
    'hover:bg-success-600',
    'active:bg-success-700',
    'focus:ring-success-400',
    'text-gray-900',
    'dark:text-white',
    // Other theme color classes that might be generated dynamically
    'bg-primary-500',
    'hover:bg-primary-600',
    'active:bg-primary-700',
    'focus:ring-primary-400',
    'bg-error-500',
    'hover:bg-error-600',
    'active:bg-error-700',
    'focus:ring-error-400',
  ],
  theme: {
    extend: {
      colors: customTheme.colors,
      spacing: customTheme.spacing,
      borderRadius: customTheme.borderRadius,
      fontSize: customTheme.typography.fontSizes,
      fontWeight: customTheme.typography.fontWeights,
      boxShadow: customTheme.shadows,
      keyframes: {
        'enter-toast': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(1rem) scale(0.96)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0) scale(1)'
          }
        },
        'gradient': {
          '0%, 100%': {
            'background-position': '0% 50%',
          },
          '50%': {
            'background-position': '100% 50%',
          },
        },
      },
      animation: {
        'enter-toast': 'enter-toast 0.2s ease-out',
        'gradient-slow': 'gradient 15s ease infinite',
      },
      backgroundSize: {
        'gradient-size': '400% 400%',
      },
    },
  },
  plugins: [],
};

export default config;
