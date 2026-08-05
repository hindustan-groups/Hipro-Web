import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
      colors: {
        surface: {
          DEFAULT: "#f8faff",
          card:    "#ffffff",
          raised:  "#f0f4ff",
        },
      },
      boxShadow: {
        "3d-sm":  "0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
        "3d-md":  "0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)",
        "3d-lg":  "0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)",
        "3d-xl":  "0 32px 80px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.08)",
        "glow-blue": "0 0 40px rgba(37,99,235,0.2), 0 0 80px rgba(37,99,235,0.1)",
        "glow-red":  "0 0 40px rgba(225,29,72,0.2), 0 0 80px rgba(225,29,72,0.1)",
        "inner-light": "inset 0 1px 0 rgba(255,255,255,0.8)",
      },
    },
  },
  plugins: [],
};
export default config;
