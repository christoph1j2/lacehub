/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Added this parent 'colors' property
        primary: {
          100: "#EDF7F1",
          200: "#D3EBDB",
          300: "#B8DFC5",
          400: "#9ED3AF",
          500: "#64C381",
          600: "#4FAB6A",
          700: "#3B8F53",
          800: "#28733C",
          900: "#155725",
        },
        secondary: {
          100: "#EFEDF4", // Very light purple
          200: "#D7D3E3",
          300: "#BFB9D2",
          400: "#A79FC1",
          500: "#644F98", // Your base secondary color
          600: "#503F82",
          700: "#3C2F6C",
          800: "#282056",
          900: "#141040", // Very dark purple
        },
        brown: "#99621E",
      },
    },
  },
  plugins: [],
};
