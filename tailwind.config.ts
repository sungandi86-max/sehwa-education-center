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
          50: "#eef7ff",
          100: "#d9ecff",
          500: "#2f80c9",
          600: "#1f6faf",
          700: "#1d5d91",
          900: "#173a5a"
        },
        slateblue: {
          50: "#f5f8fb",
          100: "#e7edf4",
          700: "#34495f",
          900: "#1f2d3a"
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(31, 45, 58, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
