import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      colors: {
        ink: { DEFAULT: "#1A1B2E", soft: "#6B6D85", muted: "#A0A2B8" },
        bg: { DEFAULT: "#F4F5F9", card: "#FFFFFF" },
        accent: { DEFAULT: "#7B6EF6", soft: "#E8E5FF" },
        sport: { golf: "#2DD4A7", tennis: "#FF8A5C", strength: "#7B6EF6", cardio: "#F1A4C5", recovery: "#A0A2B8" },
      },
      borderRadius: { xl: "16px", "2xl": "20px", "3xl": "28px" },
    },
  },
  plugins: [],
} satisfies Config;
