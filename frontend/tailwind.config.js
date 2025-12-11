/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#6d8196',
          600: '#5a6b7d',
          700: '#4a5568',
          800: '#3c4654',
          900: '#2d3748',
        },
        charcoal: '#4A4A4A',
        coolGray: '#CBCBCB',
        ivory: '#FFFFE3',
        slate: '#6D8196',
        dark: {
          50: '#FFFFE3',
          100: '#f5f5dc',
          200: '#CBCBCB',
          300: '#a8a8a8',
          400: '#7a7a7a',
          500: '#5a5a5a',
          600: '#4A4A4A',
          700: '#3a3a3a',
          800: '#2a2a2a',
          900: '#1a1a1a',
          950: '#0a0a0a',
        },
        accent: '#6D8196',
        'accent-dark': '#5a6b7d',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #6D8196 0%, #5a6b7d 100%)',
        'gradient-dark': 'linear-gradient(135deg, #4A4A4A 0%, #2a2a2a 100%)',
        'gradient-ivory': 'linear-gradient(135deg, #FFFFE3 0%, #f5f5dc 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(109, 129, 150, 0.3)',
        'glow-lg': '0 0 30px rgba(109, 129, 150, 0.4)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.15)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
