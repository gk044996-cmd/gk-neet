/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#093c5d',
        secondary: '#3b7597',
        accent: '#6fd1d7',
        highlight: '#5df8d8',
        dark: '#093c5d',
        darker: '#052236',
      }
    },
  },
  plugins: [],
}
