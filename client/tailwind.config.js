/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#60a5fa",
        secondary: "#ff9933",
        neutral: "#a6a6a6"
      },
      animation: {
        fade: 'fadeIn 0.5s ease-in-out forwards',
        bounceMid: 'bounceMiddle linear 1s infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        bounceMiddle: {
            '0%, 100%': {
                transform: 'translateY(0)',
            },
            '25%': {
                transform: 'translateY(10%)',
            },
            '50%': {
                transform: 'translateY(0)',
            },
            '75%': {
                transform: 'translateY(-10%)',
            }
        }
      }
    }
  },
  plugins: [],
}

