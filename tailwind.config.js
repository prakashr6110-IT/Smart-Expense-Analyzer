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
      colors: {
        fintech: {
          bg: '#0B1220',
          secondary: '#111827',
          card: '#1E293B',
          sidebar: '#0F172A',
        },
        accent: {
          primary: '#3B82F6',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          insights: '#8B5CF6',
          prediction: '#06B6D4',
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
