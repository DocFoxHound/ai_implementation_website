import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#13201c",
        field: "#f6f7f2",
        moss: "#356b54",
        copper: "#b16a3d",
        steel: "#4d5d66",
        line: "#d9ded8"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(19, 32, 28, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
