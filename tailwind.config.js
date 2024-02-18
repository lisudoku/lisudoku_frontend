const withMT = require('@material-tailwind/react/utils/withMT')

/** @type {import('tailwindcss').Config} */
module.exports = withMT({
  content: [
    "./index.html",
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
      colors: {
        gray: {
          850: '#323232',
          750: '#525252',
        }
      }
    },
  },
  plugins: [
    require('tailwindcss-themer')({
      themes: [
        {
          name: 'dark-theme',
          extend: {
            backgroundColor: ({ theme }) => ({
              primary: theme('colors.gray.900'),
              secondary: theme('colors.gray.850'),
              tertiary: theme('colors.gray.750'),
              highlight: theme('colors.cyan.600'),
              softhighlight: theme('colors.cyan.900'),
            }),
            textColor: ({ theme }) => ({
              primary: {
                DEFAULT: theme('colors.gray.300'),
                hover: theme('colors.gray.50'),
              },
              secondary: theme('colors.gray.400'),
              highlight: theme('colors.cyan.500'),
            }),
            borderColor: ({ theme }) => ({
              primary: theme('colors.gray.400'),
              secondary: theme('colors.gray.800'),
              highlight: theme('colors.cyan.500'),
            }),
            fill: ({ theme }) => ({
              digit: {
                unfixed: theme('colors.white'),
                fixed: theme('colors.gray.400'),
                error: theme('colors.red.600'),
                pencil: theme('colors.blue.200'),
              },
              cell: {
                selected: theme('colors.white'),
              },
              thermo: theme('colors.gray.500'),
              arrow: theme('colors.gray.500'),
              extraregion: theme('colors.cyan.900'),
              oddeven: theme('colors.gray.600'),
            }),
            stroke: ({ theme }) => ({
              cell: {
                selected: `theme('fill.cell.selected')`, // Hacks to use values from other property
                border: {
                  strong: theme('colors.white'),
                  weak: theme('colors.gray.700'),
                },
              },
              arrow: `theme('fill.arrow')`,
              thermo: `theme('fill.thermo')`,
              diagonal: theme('colors.purple.400'),
              killer: theme('colors.white'),
            }),
          },
        },
        {
          name: 'light-theme',
          extend: {
            backgroundColor: ({ theme }) => ({
              primary: theme('colors.gray.300'),
              secondary: theme('colors.gray.200'),
              tertiary: theme('colors.gray.100'),
              highlight: theme('colors.cyan.600'),
              softhighlight: theme('colors.cyan.100'),
            }),
            textColor: ({ theme }) => ({
              primary: {
                DEFAULT: theme('colors.gray.700'),
                hover: theme('colors.gray.500'),
              },
              secondary: theme('colors.gray.600'),
              tertiary: theme('colors.gray.500'),
              highlight: theme('colors.cyan.400'),
            }),
            borderColor: ({ theme }) => ({
              primary: theme('colors.gray.500'),
              secondary: theme('colors.gray.400'),
              highlight: theme('colors.cyan.500'),
            }),
            fill: ({ theme }) => ({
              digit: {
                unfixed: theme('colors.blue.900'),
                fixed: theme('colors.black'),
                error: theme('colors.red.600'),
                pencil: theme('colors.blue.600'),
              },
              cell: {
                selected: theme('colors.blue.300'),
              },
              thermo: theme('colors.gray.500'),
              arrow: theme('colors.gray.500'),
              extraregion: theme('colors.cyan.200'),
              oddeven: theme('colors.gray.400'),
            }),
            stroke: ({ theme }) => ({
              cell: {
                selected: `theme('fill.cell.selected')`, // Hacks to use values from other property
                border: {
                  strong: theme('colors.black'),
                  weak: theme('colors.gray.500'),
                },
              },
              arrow: `theme('fill.arrow')`,
              thermo: `theme('fill.thermo')`,
              diagonal: theme('colors.purple.200'),
              killer: theme('colors.black'),
            }),
          },
        },
      ]
    })
  ],
})
