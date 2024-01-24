/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["public/index.html", "./node_modules/flowbite/**/*.js"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'secondary': {
          DEFAULT: '#749e35',
          100: '#171f0a',
          200: '#2e3f15',
          300: '#455e1f',
          400: '#5c7d2a',
          500: '#749e35',
          600: '#93c34a',
          700: '#aed278',
          800: '#c9e1a5',
          900: '#e4f0d2'
        },
        'secondary_light': {
          DEFAULT: '#8abc40',
          100: '#1b250d',
          200: '#374a19',
          300: '#527026',
          400: '#6e9533',
          500: '#8abc40',
          600: '#a1ca64',
          700: '#b9d78b',
          800: '#d0e4b1',
          900: '#e8f2d8'
        },
        'primary_light': {
          DEFAULT: '#f2e318',
          100: '#322f03',
          200: '#645e06',
          300: '#968d09',
          400: '#c8bc0c',
          500: '#f2e318',
          600: '#f4e946',
          700: '#f7ee74',
          800: '#faf4a2',
          900: '#fcf9d1'
        },
        'primary': {
          DEFAULT: '#ffd400',
          100: '#332b00',
          200: '#665500',
          300: '#998000',
          400: '#ccaa00',
          500: '#ffd400',
          600: '#ffdd33',
          700: '#ffe666',
          800: '#ffee99',
          900: '#fff6cc'
        },
        'primary_accent': {
          DEFAULT: '#ff9d00',
          100: '#331f00',
          200: '#663f00',
          300: '#995e00',
          400: '#cc7e00',
          500: '#ff9d00',
          600: '#ffb133',
          700: '#ffc466',
          800: '#ffd899',
          900: '#ffebcc'
        },

      },
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

