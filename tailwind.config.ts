import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
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
        }
      },
      animation: {
        'enter-toast': 'enter-toast 0.2s ease-out'
      }
    },
  },
  plugins: [],
};

export default config;
