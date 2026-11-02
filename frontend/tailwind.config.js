/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5', // Deep Indigo Primary
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          950: '#1E1B4B',
        },
        accent: {
          light: '#38BDF8', // Electric Blue
          DEFAULT: '#0EA5E9',
          dark: '#0284C7',
          glow: '#60A5FA',
        },
        surface: {
          light: '#FFFFFF',
          soft: '#F8FAFC',
          muted: '#F1F5F9',
          border: '#E2E8F0',
          dark: '#0B0F19',
          darkMuted: '#111827',
          darkCard: '#1E293B',
          darkBorder: '#334155',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(79, 70, 229, 0.3)',
        'glow-md': '0 0 25px -5px rgba(79, 70, 229, 0.35)',
        'glow-accent': '0 0 25px -5px rgba(56, 189, 248, 0.4)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};
