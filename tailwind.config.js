/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'display': ['48px', { fontWeight: '700', lineHeight: '1.2' }],
        'h1': ['32px', { fontWeight: '600', lineHeight: '1.3' }],
        'h2': ['24px', { fontWeight: '600', lineHeight: '1.3' }],
        'h3': ['18px', { fontWeight: '500', lineHeight: '1.4' }],
        'body': ['15px', { fontWeight: '400', lineHeight: '1.6' }],
        'caption': ['12px', { fontWeight: '400', lineHeight: '1.5' }],
      },
      colors: {
        brand: {
          teal: '#00C9A7',
          purple: '#7C6FFF',
          dark: '#0B1220',
        },
        fintech: {
          bg: '#0B1220',
          secondary: '#111827',
          card: '#1E293B',
          sidebar: '#0F172A',
        },
        accent: {
          primary: '#00C9A7',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          insights: '#7C6FFF',
          prediction: '#00C9A7',
        },
        txt: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          muted: '#64748B',
        },
        sidebar: {
          DEFAULT: '#0F172A',
          hover: '#1E293B',
          active: '#111827',
        },
        expense: {
          food: '#f59e0b',
          transport: '#3b82f6',
          entertainment: '#8b5cf6',
          shopping: '#ec4899',
          bills: '#ef4444',
          health: '#10b981',
          other: '#6b7280',
        }
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0,0,0,0.08)',
        'card-hover': '0 12px 40px rgba(0,0,0,0.14)',
        'card-dark': '0 4px 24px rgba(0,0,0,0.3)',
        'card-dark-hover': '0 12px 40px rgba(0,0,0,0.45)',
        'glow-teal': '0 0 24px rgba(0,201,167,0.35)',
        'glow-teal-lg': '0 0 48px rgba(0,201,167,0.45)',
        'glow-purple': '0 0 24px rgba(124,111,255,0.35)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'ripple': 'ripple 2.5s ease-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        ripple: {
          '0%': { transform: 'scale(1)', opacity: '0.4' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
