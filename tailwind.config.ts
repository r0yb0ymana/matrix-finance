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
        // Primary - Navy
        primary: {
          DEFAULT: '#1E2C5E',
          50: '#E8EBF3',
          100: '#C5CCE0',
          200: '#9FAACC',
          300: '#7888B8',
          400: '#5B6FA8',
          500: '#3E5699',
          600: '#374E91',
          700: '#2F4386',
          800: '#27397C',
          900: '#1E2C5E',
          950: '#111A3A',
        },
        // Accent - Light Blue
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
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
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
