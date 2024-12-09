/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#218225",
        secondary: "#A0CA49",
        danger: "#FF4C4C",
        lightDark: "#D2D8D5",
        grey: "#8E8E8E",
        background: "#fdfffd",
        black: "#292D32",
      },
      fontFamily: {},
    },
  },
  plugins: [],
};
