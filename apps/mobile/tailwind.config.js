module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#A78BFA',
        'primary-light': '#EDE9FE',
        'primary-dark': '#7C3AED',
        background: '#F5F5F7',
        card: '#FFFFFF',
        'text-primary': '#111111',
        'text-secondary': '#6B7280',
        'text-muted': '#9CA3AF',
        success: '#22C55E',
        'success-light': '#DCFCE7',
        warning: '#F59E0B',
        'warning-light': '#FEF3C7',
        danger: '#EF4444',
        'danger-light': '#FEE2E2',
        border: '#E5E7EB',
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
