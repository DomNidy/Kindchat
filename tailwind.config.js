/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        wispgray: {
          900: '#202225',
          800: '#2f3136',
          700: '#36393f'
        }
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar')
  ],
}

