/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14213d',
        accent: '#fca311',
        mist: '#e5ecf4',
        signal: '#27ae60',
        danger: '#d62828'
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif']
      }
    },
  },
  plugins: [],
};
