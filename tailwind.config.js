/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#0b0912',
          900: '#110e1b',
          850: '#161224',
          800: '#1c182c',
          700: '#2a2440',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(17, 12, 34, 0.04), 0 8px 24px -6px rgba(76, 29, 149, 0.10)',
        glow: '0 10px 30px -8px rgba(124, 58, 237, 0.55)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'soft-pulse': {
          '0%, 100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.04)' },
        },
        'draw-check': {
          from: { strokeDashoffset: '48' },
          to: { strokeDashoffset: '0' },
        },
        'toast-in': {
          from: { opacity: '0', transform: 'translate(-50%, 12px)' },
          to: { opacity: '1', transform: 'translate(-50%, 0)' },
        },
        float: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(12px, -18px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease-out both',
        'scale-in': 'scale-in 0.28s cubic-bezier(0.2, 0.9, 0.3, 1.2) both',
        'soft-pulse': 'soft-pulse 3.2s ease-in-out infinite',
        'draw-check': 'draw-check 0.6s 0.2s ease-out both',
        'toast-in': 'toast-in 0.3s ease-out both',
        float: 'float 14s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
