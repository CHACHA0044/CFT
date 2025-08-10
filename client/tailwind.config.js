/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        germania: ['GermaniaOne', 'sans-serif'],
        sriracha: ['Sriracha', 'cursive'],
        bespoke: ['"Bespoke Stencil"', 'sans-serif'],
        intertight: ['InterTight', 'sans-serif'],
      },
      animation: {
        aurora: "aurora 10s ease-in-out infinite alternate",
        smoke: "smoke 2s ease-out infinite",
      },
      keyframes: {
        aurora: {
          "0%": { transform: "translateY(0%) scale(1)" },
          "50%": { transform: "translateY(-10%) scale(1.1)" },
          "100%": { transform: "translateY(0%) scale(1)" },
        },
        smoke: {
          "0%": {
            transform: "translateY(0) scale(0.9)",
            opacity: 0.4,
          },
          "30%": {
            transform: "translateY(-10px) scale(1)",
            opacity: 0.3,
          },
          "60%": {
            transform: "translateY(-20px) scale(1.1)",
            opacity: 0.2,
          },
          "100%": {
            transform: "translateY(-30px) scale(1.2)",
            opacity: 0,
          },
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
      textShadow: {
        sm: '1px 1px 2px rgba(0, 0, 0, 0.3)',
        DEFAULT: '2px 2px 4px rgba(0, 0, 0, 0.5)',
        lg: '3px 3px 6px rgba(0, 0, 0, 0.6)',
        glow: '0 0 8px rgba(0, 255, 150, 0.7)',
      },
      backgroundImage: {
        'dashboard': "url('/images/dashboard-bk.webp')",
      },
      willChange: {
        scroll: 'scroll-position',
        transform: 'transform',
      },
      animationDelay: {
        0: '0ms',
        100: '100ms',
        200: '200ms',
        300: '300ms',
        400: '400ms',
        500: '500ms',
        600: '600ms',
        700: '700ms',
        800: '800ms',
        900: '900ms',
        1000: '1000ms',
      },
    },
  },
  plugins: [require('tailwindcss-textshadow')],
};
