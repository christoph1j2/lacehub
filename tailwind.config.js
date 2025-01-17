/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Added this parent 'colors' property
        primary: {
          100: "#E6F5EC", // Lightest
          200: "#C4E6D1",
          300: "#A2D7B6",
          400: "#80C89B",
          500: "#64C381", // Base color
          600: "#50B46E",
          700: "#3C9A58",
          800: "#287F42",
          900: "#14652C", // Darkest
        },

        secondary: {
          100: "#E6E2FB", // Lightest
          200: "#C4BDF6",
          300: "#A199F1",
          400: "#7F74EB",
          500: "#5C50E6",
          600: "#5438DC", // Base color
          700: "#432DB0",
          800: "#322284",
          900: "#211758", // Darkest
        },
        extraColor1: {
          100: "#FFF1EE", // Lightest
          200: "#FFD9D1",
          300: "#FFC1B4",
          400: "#FFA997",
          500: "#FF917A",
          600: "#FF4A1C", // Base color
          700: "#E63200",
          800: "#B32700",
          900: "#801C00", // Darkest
        },
        accent: {
          100: "#FFF2E0", // Lightest
          200: "#FFD9B3",
          300: "#FFC086",
          400: "#FFA759",
          500: "#FF8E2C",
          600: "#FFA62B", // Base color
          700: "#CC8422",
          800: "#996319",
          900: "#664210", // Darkest
        },
      },
      safelist: [
        "bg-primary-600",
        "bg-transparent",
        "hover:bg-primary-600",
        "translate-y-0",
        "-translate-y-full",
      ],
    },
  },
  plugins: [],
};
