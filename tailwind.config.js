/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#091422",
          900: "#0F1B2D",
          700: "#1A3A5C",
          500: "#2E6DB4",
        },
        accent: {
          DEFAULT: "#4A9EFF",
          light: "#5CB8FF",
        },
        clinical: {
          text: "#E8F4FF",
          secondary: "#A8C4E0",
          muted: "#6B8BAA",
        },
      },
      fontFamily: {
        mono: ["SpaceMono", "monospace"],
      },
    },
  },
  plugins: [],
};
