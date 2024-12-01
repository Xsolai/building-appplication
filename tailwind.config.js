/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        scaleOut: {
          '0%': {
            transform: 'scale(0)',
            opacity: 1
          },
          '100%': {
            transform: 'scale(1)',
            opacity: 0
          }
        },
        dot1: {
          '0%': { 
            transform: 'scale(0)',
            opacity: '0'
          },
          '100%': { 
            transform: 'scale(1)',
            opacity: '1'
          }
        },
        dot2: {
          '0%, 25%': { 
            transform: 'scale(0)',
            opacity: '0'
          },
          '100%': { 
            transform: 'scale(1)',
            opacity: '1'
          }
        },
        dot3: {
          '0%, 50%': { 
            transform: 'scale(0)',
            opacity: '0'
          },
          '100%': { 
            transform: 'scale(1)',
            opacity: '1'
          }
        },
        dot4: {
          '0%, 75%': { 
            transform: 'scale(0)',
            opacity: '0'
          },
          '100%': { 
            transform: 'scale(1)',
            opacity: '1'
          }
        }
      },
      animation: {
        scaleOut: 'scaleOut 1s ease-in infinite',
        dot1: 'dot1 1s ease-out infinite',
        dot2: 'dot2 1s ease-out infinite',
        dot3: 'dot3 1s ease-out infinite',
        dot4: 'dot4 1s ease-out infinite'
      }
    }
  },
  plugins: [],
};