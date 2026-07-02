import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F4F8FF",
          100: "#E7F0FF",
          200: "#D8E7FF",
          500: "#5D8ED8",
          600: "#3367AD",
          700: "#244D89",
          900: "#173B73"
        },
        slateblue: {
          50: "#F7F9FC",
          100: "#E8EDF5",
          700: "#475569",
          900: "#172033"
        },
        softpurple: {
          50: "#F7F4FF",
          100: "#EEE8FF",
          300: "#CEC1F4"
        }
      },
      boxShadow: {
        soft: "0 22px 64px rgba(23, 59, 115, 0.07), 0 6px 18px rgba(23, 59, 115, 0.04)",
        lift: "0 32px 86px rgba(23, 59, 115, 0.13), 0 10px 26px rgba(23, 59, 115, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
