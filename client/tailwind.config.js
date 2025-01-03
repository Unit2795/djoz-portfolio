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
        bounceMid: 'bounceMiddle 1s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        bounceMiddle: {
            '0%, 100%': {
                transform: 'translateY(-10%)',
                animationTimingFunction: 'cubic-bezier(0.8,0,1,1)'
            },
            '50%': {
                transform: 'translateY(10%)',
                animationTimingFunction: 'cubic-bezier(0,0,0.2,1)'
            }
        }
      }
    }
  },
  plugins: [],
}

