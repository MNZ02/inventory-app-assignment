module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#A78BFA',
          light: '#EDE9FE',
          dark: '#7C3AED',
        },
        background: {
          DEFAULT: '#F5F5F7',
          dark: '#111111',
        },
        card: {
          DEFAULT: '#FFFFFF',
          dark: '#1F2937',
        },
        'text-primary': {
          DEFAULT: '#111111',
          dark: '#F9FAFB',
        },
        'text-secondary': {
          DEFAULT: '#6B7280',
          dark: '#9CA3AF',
        },
        'text-muted': {
          DEFAULT: '#9CA3AF',
          dark: '#6B7280',
        },
        success: {
          DEFAULT: '#22C55E',
          light: '#DCFCE7',
          dark: '#059669',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
          dark: '#D97706',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
          dark: '#DC2626',
        },
        border: {
          DEFAULT: '#E5E7EB',
          dark: '#374151',
        },
      },
      fontFamily: {
        sans:     ['Inter_400Regular'],
        medium:   ['Inter_500Medium'],
        semibold: ['Inter_600SemiBold'],
        bold:     ['Inter_700Bold'],
      },
    },
  },
  plugins: [],
};
