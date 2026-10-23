import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
    "../../../packages/ui/dist/**/*.{js,mjs}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#454545",
        secondary: "#06bfa2",
        tertiary: "#0f7f6d",
        neutral: "#F7F8F8",
        surface: "#FFFFFF",
        border: "#E3E8E7",
      },
      fontFamily: {
        heading: ["Lora", "serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
