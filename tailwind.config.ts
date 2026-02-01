import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand - Matrix Blue (from Figma screenshots - logo blue)
        brand: {
          navy: '#2B5F8C',      // Primary brand blue (from logo)
          'navy-dark': '#234D73',   // Hover/active states
          'navy-light': '#3A7AB0',  // Lighter variant
          black: '#000000',     // MATRIX wordmark
        },
        // Primary - Blue scale
        primary: {
          DEFAULT: '#2B5F8C',
          50: '#EBF2F7',
          100: '#D1E3ED',
          200: '#A8C9DC',
          300: '#7EAFCA',
          400: '#5595B9',
          500: '#2B7BA7',
          600: '#2B5F8C',
          700: '#234D73',
          800: '#1C3B5A',
          900: '#142941',
          950: '#0D1A29',
        },
        // Accent - Light Blue (from Figma)
        accent: {
          DEFAULT: '#F5F8FC',
          50: '#FFFFFF',
          100: '#F5F8FC',
          200: '#E8EEF7',
          300: '#D4E0F0',
          400: '#B8CCE5',
          500: '#9BB8DA',
        },
        // Semantic
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
          dark: '#059669',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
          dark: '#D97706',
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
          dark: '#DC2626',
        },
        info: {
          DEFAULT: '#3B82F6',
          light: '#DBEAFE',
          dark: '#2563EB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'button': '0.5rem',  // 8px - for buttons
        'card': '0.75rem',   // 12px - for cards
        'input': '0.375rem', // 6px - for inputs
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(30 44 94 / 0.1), 0 1px 2px -1px rgb(30 44 94 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(30 44 94 / 0.1), 0 2px 4px -2px rgb(30 44 94 / 0.1)',
        'button': '0 1px 2px 0 rgb(30 44 94 / 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
