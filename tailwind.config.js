/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:      '#0a0a0a',
        surface: '#161616',
        border:  '#232323',
        income:  '#22c55e',
        expense: '#ef4444',
        goal:    '#eab308',
        muted:   '#8b8b93',
        pro:     '#a78bfa',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['3rem',   { lineHeight: '1', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-lg': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['1.5rem',  { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
      },
      boxShadow: {
        'glow-income': '0 0 20px rgba(34, 197, 94, 0.15)',
        'glow-pro':    '0 0 20px rgba(167, 139, 250, 0.15)',
        'btn':         '0 1px 3px rgba(0,0,0,0.4)',
        'btn-hover':   '0 4px 12px rgba(0,0,0,0.5)',
      },
      keyframes: {
        'bar-grow': {
          '0%':   { width: '0%' },
          '100%': { width: 'var(--bar-w)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'goal-shine': {
          '0%':   { backgroundPosition: '-100% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },
      animation: {
        'bar-grow':  'bar-grow 600ms cubic-bezier(.16,1,.3,1) both',
        'shimmer':   'shimmer 1.5s linear infinite',
        'fade-up':   'fade-up 300ms ease both',
        'goal-shine':'goal-shine 800ms ease forwards',
      },
    },
  },
  plugins: [],
}
