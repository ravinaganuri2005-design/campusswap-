/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669', // Emerald Primary
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#1e3048',
          900: '#0f172a', // Dark Navy Blue Secondary
          950: '#080d1a',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 12px -2px rgba(15, 23, 42, 0.08), 0 4px 20px -2px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 12px 28px -4px rgba(15, 23, 42, 0.12), 0 8px 16px -4px rgba(5, 150, 105, 0.08)',
      }
    },
  },
  plugins: [],
}
