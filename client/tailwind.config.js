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
				bounceMid: 'bounceMiddle linear 1s infinite',
				topRotateIn: 'rotateIn 1s ease-in-out forwards',
				bottomRotateIn: 'rotateOut 1s ease-in-out forwards',
			},
			keyframes: {
				fadeIn: {
					'0%': {opacity: 0},
					'100%': {opacity: 1}
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
				},
				rotateIn: {
					'0%': { transform: 'rotateX(90deg)', opacity: '0' },
					'100%': { transform: 'rotateX(0deg)', opacity: '1' },
				},
				rotateOut: {
					'0%': { transform: 'rotateX(-90deg)', opacity: '0' },
					'100%': { transform: 'rotateX(0deg)', opacity: '1' },
				},
			}
		}
	},
	plugins: [],
}

