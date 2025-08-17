/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
       fontFamily: {
        
        
      },
      keyframes: {
        "pulse-slow": {
          "0%, 100%": { opacity: "0.7" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "pulse-slow": "pulse-slow 3s infinite ease-in-out",
      },
    },
  },
  plugins: [],
}