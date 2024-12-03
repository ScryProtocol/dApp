// tailwind.config.js
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  purge: [
    './pages/**/*.{js,jsx,ts,tsx}', 
    './components/**/*.{js,jsx,ts,tsx}', 
    './layout/**/*.{js,jsx,ts,tsx}', 
    './public/**/*.{js,jsx,ts,tsx}', 
    './styles/**/*.{js,jsx,ts,tsx,css}'
  ], theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [    require('@tailwindcss/typography'), // Add the typography plugin
],
};
