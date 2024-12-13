/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Added this parent 'colors' property
        primary: {
          100: "#a6dcb3",
          200: "#96d6a6",
          300: "#86cf9a",
          400: "#76c98d",
          500: "#64c381",
          600: "#56a96f",
          700: "#48905e",
          800: "#3b784e",
          900: "#2e603e",
        },
        secondary: {
          100: "#9e93c2",
          200: "#8f82b8",
          300: "#8071ad",
          400: "#7260a3",
          500: "#644f98",
          600: "#564484",
          700: "#483870",
          800: "#3b2e5c",
          900: "#2e234a",
        },
        brown: "#99621E",
      },
    },
  },
  plugins: [],
};
