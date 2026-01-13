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
        blue: {
          50: '#f0f9ff',
          100: '#d4edff',
          200: '#b8e1ff',
          300: '#9cd5ff',
          400: '#73d2ff',
          500: '#5bb8e6',
          600: '#4a9ccc',
          700: '#3c7fa3',
          800: '#2e6279',
          900: '#1f4550',
        },
      },
      fontFamily: {
        sans: ['Nunito_400Regular', 'system-ui', 'sans-serif'],
        nunito: ['Nunito_400Regular', 'system-ui', 'sans-serif'],
        'nunito-semibold': ['Nunito_600SemiBold', 'system-ui', 'sans-serif'],
        'nunito-bold': ['Nunito_700Bold', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
