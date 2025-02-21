/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          100: "#E6F5EC",
          200: "#C4E6D1",
          300: "#A2D7B6",
          400: "#80C89B",
          500: "#64C381",
          600: "#50B46E",
          700: "#3C9A58",
          800: "#287F42",
          900: "#14652C",
        },
        secondary: {
          100: "#E6E2FB",
          200: "#C4BDF6",
          300: "#A199F1",
          400: "#7F74EB",
          500: "#5C50E6",
          600: "#5438DC",
          700: "#432DB0",
          800: "#322284",
          900: "#211758",
        },
        extraColor1: {
          100: "#FFF1EE",
          200: "#FFD9D1",
          300: "#FFC1B4",
          400: "#FFA997",
          500: "#FF917A",
          600: "#FF4A1C",
          700: "#E63200",
          800: "#B32700",
          900: "#801C00",
        },
        accent: {
          100: "#FFF2E0",
          200: "#FFD9B3",
          300: "#FFC086",
          400: "#FFA759",
          500: "#FF8E2C",
          600: "#FFA62B",
          700: "#CC8422",
          800: "#996319",
          900: "#664210",
        },
      },
    },
  },
  safelist: [
    // Layout & Positioning
    "translate-x-0",
    "-translate-x-full",
    "md:translate-x-0",
    "translate-y-0",
    "-translate-y-full",

    // Backgrounds
    "bg-primary-50",
    "bg-primary-100",
    "bg-primary-200",
    "bg-primary-300",
    "bg-primary-400",
    "bg-primary-500",
    "bg-primary-600",
    "bg-primary-700",
    "bg-primary-800",
    "bg-primary-900",

    "bg-secondary-500",
    "bg-secondary-600",
    "bg-secondary-700",

    "bg-accent-500",
    "bg-accent-600",

    "bg-transparent",

    // Hover states
    "hover:bg-primary-200",
    "hover:bg-primary-600",
    "hover:bg-primary-800",
    "hover:bg-secondary-600",
    "hover:bg-accent-600",

    // Text colors
    "text-primary-700",
    "text-primary-900",
    "text-white",

    // Borders
    "border-primary-200",
    "border-primary-300",
    "border-extraColor1-500",

    // Background opacity
    "bg-opacity-50",

    // Other dynamic classes
    "opacity-50",
    "cursor-not-allowed",
  ],
  plugins: [],
};
