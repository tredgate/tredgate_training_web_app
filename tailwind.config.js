/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "neon-purple": "#a855f7",
        "electric-blue": "#3b82f6",
      },
      boxShadow: {
        "glow-purple": "0 0 15px rgba(168, 85, 247, 0.5)",
        "glow-blue": "0 0 15px rgba(59, 130, 246, 0.5)",
        "glow-red": "0 0 20px rgba(239, 68, 68, 0.6)",
      },
    },
  },
  plugins: [],
};
