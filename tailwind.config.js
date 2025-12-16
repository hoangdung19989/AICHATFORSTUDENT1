/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': {
          'DEFAULT': '#39508A',
          'dark': '#2A3F7A',
        },
        'brand-yellow': '#FFD700',
        'brand-bg': '#F0F4F9',
      },
    },
  },
  plugins: [],
}
