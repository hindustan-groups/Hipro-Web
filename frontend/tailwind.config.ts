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
        sans:    ["var(--font-montserrat)", "Montserrat", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-montserrat)", "Montserrat", "system-ui", "sans-serif"],
        serif:   ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        accent:  ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
      },
      colors: {
        surface: {
          DEFAULT: "#f8faff",
          card:    "#ffffff",
          raised:  "#f0f4ff",
        },
        brand: {
          navy: "#0F2C59",
          red: "#D9232A",
          redDark: "#B91C1C",
          blue: "#0B2545",
          blueDark: "#091D36",
        },
        construction: {
          navy: "#0F2C59", // Official Hindustan Deep Royal Navy Blue
          blue: "#0B2545",
          red: "#D9232A",  // Official Projects Crimson Red
          orange: "#D9232A", // Alias to Crimson Red for site-wide consistency
          yellow: "#eab308",
        }
      },
    },
  },
  plugins: [],
};
export default config;
