/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'gradient-x': 'gradient-x 3s ease infinite',
        'drift': 'drift 40s linear infinite',
        'drift-slow': 'drift 60s linear infinite reverse',
        'pulse-once': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) 1',
        'blink': 'blink 1s ease-in-out infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
        },
        'drift': {
          '0%': { transform: 'translateY(0px) translateX(0px)' },
          '100%': { transform: 'translateY(-100px) translateX(-50px)' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        }
      },
    },
  },
  plugins: [],
}
