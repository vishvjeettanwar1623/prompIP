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
        dark: '#0F1419',
        darker: '#0B0E11',
        card: '#1A1F26',
        border: '#2A3441',
        accent: '#10B981',
      },
    },
  },
  plugins: [],
}
