/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", "sans-serif"],
      },
      fontSize: {
        xs: ['12px', '16px'],
        sm: ['14px', '20px'],
        base: ['16px', '22px'],
        lg: ['18px', '24px'],
        xl: ['20px', '26px'],
        '2xl': ['24px', '30px'],
      },
    },
  },
  plugins: [],
}
