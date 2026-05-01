/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: {
          950: '#0a0a0f',
          900: '#12121a',
          800: '#1c1c28',
          700: '#272737',
          600: '#363650',
        },
        gold: {
          400: '#f5c842',
          500: '#e6b800',
          600: '#c49a00',
        },
        cream: {
          50:  '#fdfbf4',
          100: '#faf5e4',
          200: '#f5ead0',
        },
        sage: {
          400: '#7ab89a',
          500: '#5da37e',
          600: '#458a65',
        }
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")",
      }
    },
  },
  plugins: [],
}
