// tailwind.config.js
module.exports = {
  purge: [
    './pages/**/*.{js,jsx,ts,tsx}', 
    './components/**/*.{js,jsx,ts,tsx}', 
    './layout/**/*.{js,jsx,ts,tsx}', 
    './public/**/*.{js,jsx,ts,tsx}', 
    './styles/**/*.{js,jsx,ts,tsx,css}'
  ],  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
