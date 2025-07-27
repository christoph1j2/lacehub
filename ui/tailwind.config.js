/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          100: "#E5E7EB", // Lightest
          200: "#D1D5DB",
          300: "#9CA3AF",
          400: "#6B7280",
          500: "#4B5563",
          600: "#374151",
          700: "#1F2937",
          800: "#1A202C", // Base color
          900: "#111827", // Darkest
        },
        secondary: {
          100: "#FFEDD5", // Lightest
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#F97316", // Base color
          600: "#EA580C",
          700: "#C2410C",
          800: "#9A3412",
          900: "#7C2D12", // Darkest
        },
        accent: {
          100: "#FEE2E2", // Lightest
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#EF4444", // Base color
          600: "#DC2626",
          700: "#B91C1C",
          800: "#991B1B",
          900: "#7F1D1D", // Darkest
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
  ],
  plugins: [],
};
