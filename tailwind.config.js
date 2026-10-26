/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./frontend/index.html', './frontend/src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        "Courgette": ["Courgette", "cursive"],
        "StoryScript": ["Story Script", "cursive"],
      },
    },
  },
  plugins: [],
}
