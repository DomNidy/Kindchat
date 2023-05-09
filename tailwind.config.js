/** @type {import('tailwindcss').Config} */
module.exports = {
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
  plugins: [],
}

