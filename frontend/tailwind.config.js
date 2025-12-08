/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#10B981', // Green accent
        secondary: '#059669', // Darker green
        dark: {
          900: '#0a0a0a', // Darkest background
          800: '#111111', // Card background
          700: '#1a1a1a', // Lighter card
          600: '#262626', // Border/divider
          500: '#404040', // Muted elements
        },
        accent: '#10B981',
      },
    },
  },
  plugins: [],
}
