import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#534AB7",
          dark: "#413890",
          light: "#EBEAFA",
        },
        secondary: {
          DEFAULT: "#1D9E75",
          dark: "#167A5A",
          light: "#E4F6EF",
        },
      },
    },
  },
  plugins: [],
};
export default config;
