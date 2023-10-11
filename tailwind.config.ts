import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderColor: {
        DEFAULT: "#000000",
      },
    },
  },
  plugins: [],
} satisfies Config;
