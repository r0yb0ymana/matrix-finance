/**
 * Matrix Equipment Finance - Design Tokens
 * 
 * Brand Guidelines:
 * - Primary: Navy #1E2C5E
 * - Accent: Light Blue #F5F8FC
 * - Typography: Inter/Poppins
 * - Rounded buttons for approachability
 * - Clean spacing and white-space emphasis
 */

export const colors = {
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
    900: '#1E2C5E', // Primary brand color
    950: '#111A3A',
  },
  
  // Accent - Light Blue
  accent: {
    DEFAULT: '#F5F8FC',
    50: '#FFFFFF',
    100: '#F5F8FC', // Primary accent
    200: '#E8EEF7',
    300: '#D4E0F0',
    400: '#B8CCE5',
    500: '#9BB8DA',
  },
  
  // Semantic colors
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
  
  // Neutrals
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
} as const;

export const typography = {
  fontFamily: {
    sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
    display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  DEFAULT: '0.375rem', // 6px
  md: '0.5rem',    // 8px - buttons
  lg: '0.75rem',   // 12px - cards
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(30 44 94 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(30 44 94 / 0.1), 0 1px 2px -1px rgb(30 44 94 / 0.1)',
  md: '0 4px 6px -1px rgb(30 44 94 / 0.1), 0 2px 4px -2px rgb(30 44 94 / 0.1)',
  lg: '0 10px 15px -3px rgb(30 44 94 / 0.1), 0 4px 6px -4px rgb(30 44 94 / 0.1)',
  xl: '0 20px 25px -5px rgb(30 44 94 / 0.1), 0 8px 10px -6px rgb(30 44 94 / 0.1)',
} as const;

// Z-index scale
export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;
