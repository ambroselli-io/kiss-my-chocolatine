import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        app: {
          "50": "#fffeea",
          "100": "#fffac5",
          "200": "#fff685",
          "300": "#ffea46",
          "400": "#ffdb1b",
          "500": "#ffbb01",
          "600": "#e29000",
          "700": "#bb6502",
          "800": "#984e08",
          "900": "#7c400b",
          "950": "#482000",
        },
      },
      borderColor: {
        DEFAULT: "#000000",
      },
      maxWidth: (theme) => {
        const extendedMaxWidthFromWidth: any = {};
        for (const [key, value] of Object.entries(theme("width"))) {
          extendedMaxWidthFromWidth[key] = value;
        }
        return extendedMaxWidthFromWidth;
      },
    },
  },
  plugins: [forms],
} satisfies Config;
