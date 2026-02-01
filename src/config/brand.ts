/**
 * Brand Configuration
 * Matrix Equipment Finance Brand Guidelines
 */

export const brand = {
  name: 'Matrix Equipment Finance',
  tagline: 'Equipment Finance Solutions',

  colors: {
    // Primary brand colors from logo
    primary: {
      black: '#000000',      // MATRIX wordmark
      blue: '#2B5F8C',       // EQUIPMENT FINANCE text
      blueDark: '#1A3D5C',   // Darker shade for hover states
      blueLight: '#3A7FB3',  // Lighter shade for backgrounds
    },

    // Supporting palette
    secondary: {
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
      accent: '#4A9FD8',     // Lighter blue for accents
    },

    // Semantic colors
    semantic: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
  },

  typography: {
    // Font families
    fonts: {
      sans: 'var(--font-geist-sans)',
      mono: 'var(--font-geist-mono)',
      heading: 'var(--font-geist-sans)',
    },

    // Font sizes
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    },

    // Font weights
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  spacing: {
    page: {
      paddingX: '1.5rem',  // Mobile
      paddingXDesktop: '3rem', // Desktop
      maxWidth: '1280px',
    },
  },

  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },

  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
} as const;

export type Brand = typeof brand;
