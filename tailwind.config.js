/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        green: {
          50: '#f0faf6',
          100: '#d4f0e3',
          200: '#b8e6d0',
          300: '#9cdcbd',
          400: '#90dcb5',
          500: '#73c19a',
          600: '#57a67f',
          700: '#468566',
          800: '#35644d',
          900: '#244333',
        },
      },
    },
  },
  plugins: [],
};
