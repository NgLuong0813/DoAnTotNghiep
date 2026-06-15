/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Màu chủ đạo UTT
        'utt-xanh': {
          50:  '#e6f0ff',
          100: '#cce0ff',
          200: '#99c2ff',
          400: '#4d99ff',
          500: '#1a77ff',
          600: '#0066CC',   // Màu xanh chính
          700: '#0052a3',
          800: '#003d7a',
          900: '#002952',
        },
        'utt-cam': {
          50:  '#fff3e6',
          100: '#ffe7cc',
          200: '#ffcf99',
          400: '#ff9e4d',
          500: '#ff8726',
          600: '#F47920',   // Màu cam chính
          700: '#c36119',
          800: '#924911',
          900: '#623009',
        },
      },
      fontFamily: {
        'viet': ['Be Vietnam Pro', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
