/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        autobier: {
          50: '#fef2f4',
          100: '#fde6e9',
          200: '#fbd0d8',
          300: '#f7aab9',
          400: '#f17a93',
          500: '#e94560',
          600: '#d52a4a',
          700: '#b31d3c',
          800: '#961b38',
          900: '#1a1a2e',
          950: '#0f0f1b',
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
        'bounce-in': 'bounce-in 0.5s ease-out both',
      },
    },
  },
  plugins: [],
}
