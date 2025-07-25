/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scan all components in your src folder
    "./public/index.html"
  ],
  darkMode: 'class', // Enables class-based dark mode (you’re using this)
  theme: {
    extend: {
     animation: {
      aurora: "aurora 10s ease-in-out infinte alternate"
     },
     keyframes:{
       aurora: {
          "0%": { transform: "translateY(0%) scale(1)" },
          "50%": { transform: "translateY(-10%) scale(1.1)" },
          "100%": { transform: "translateY(0%) scale(1)" },
        },
     },
      colors: {
        emerald: {
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
      },
      dropShadow: {
        subtle: '0 1px 2px rgba(0, 0, 0, 0.4)',
      },
      backgroundImage: {
        'dashboard': "url('/images/dashboard-bk.webp')",
      },
       willChange: {
        scroll: 'scroll-position',
        transform: 'transform',
      },
    },
  },
  plugins: [],
}
