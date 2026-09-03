/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ner: {
          dark: '#0f172a',
          card: '#1e293b',
          primary: '#10b981', // Forest Green
          accent: '#06b6d4',  // Cyan Mountain
          warning: '#f59e0b', // Amber Alert
          danger: '#ef4444',  // Crimson Obstruction
          purple: '#8b5cf6',  // AI Corridor
        }
      }
    },
  },
  plugins: [],
}
