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
        heading: ['Poppins', 'sans-serif'],
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
      animation: {
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}
