import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        darkpink: "#F9476B",
        pink: "#FFE0E6",
        lightpink: "#FFF9F9",
        darkgray: "#7E7E7E",
        gray: "#A5A5A5",
        lightgray: "#D9D9D9",
      },
    },
  },
  plugins: [],
};
export default config;
