const withMT = require('@material-tailwind/react/utils/withMT')

/** @type {import('tailwindcss').Config} */
module.exports = withMT({
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        expand: {
          '0% 100%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.33)' },
          '50%': { transform: 'scale(1.66)' },
          '75%': { transform: 'scale(2.0)' },
        },
      },
      animation: {
        expand: 'expand 0.65s ease-in-out 0s 3',
      },
    },
  },
  plugins: [],
})
