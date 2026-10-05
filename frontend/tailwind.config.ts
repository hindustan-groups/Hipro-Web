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
        // HBS: Technical/data mono for metrics, service numbers, and spec values
        mono:    ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
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
        },

        // ─── HBS (Hind Building Solutions) Design Token System ───────────────
        // Industrial Precision & Engineering Durability
        hbs: {
          // Primary / Accent: Amber Industrial
          amber: {
            50:  "#FFFBEB", // Highlights / Badges
            100: "#FEF3C7", // Pill Tags
            400: "#FBBF24", // Dark Mode Accents (text on dark slate)
            500: "#F59E0B", // Brand Core Amber — interactive borders, icons
            600: "#D97706", // Primary CTA Background / Button Action
            700: "#B45309", // Text contrast on light backgrounds (WCAG AA: 5.1:1)
          },
          // Base / Structural: Slate Granite
          slate: {
            50:  "#F8FAFC", // Page Light Canvas
            100: "#F1F5F9", // Dividers & Subdued Cards
            200: "#E2E8F0", // Borders
            700: "#334155", // Subheadings / Secondary Text
            800: "#1E293B", // Dark Cards / Structural Section Lines
            900: "#0F172A", // Surface Dark / Section Base
            950: "#020617", // Hero & Technical Canvas
          },
          // Endorsement / Heritage: Parent Company Anchor
          navy:    "#0F2C59", // Badge Border / Endorsement Accent (matches HiPRO brand.navy)
          // Feedback & Utility
          emerald: "#059669", // WhatsApp CTA & Active Guarantees / Warranty Badges
          crimson: "#DC2626", // Emergency Alerts & Urgency Banners
        },
        // ─────────────────────────────────────────────────────────────────────
      },
      // HBS Elevation & Geometry
      boxShadow: {
        // Industrial crisp — replaces ad-hoc shadow-xs/shadow-xl combinations
        "hbs-card":  "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px -2px rgba(0,0,0,0.06)",
        "hbs-crisp": "0 1px 3px rgba(0,0,0,0.08), 0 10px 25px -5px rgba(0,0,0,0.12)",
        "hbs-glow":  "0 0 0 2px #F59E0B40, 0 4px 16px rgba(245,158,11,0.15)",
      },
      keyframes: {
        // HBS: Subtle pulse for emergency/warranty/active badges
        "hbs-pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.7" },
        },
        // HBS: Engineering scanline grid animation (subtle hero backdrop)
        "hbs-scan": {
          "0%":   { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "0 40px" },
        },
      },
      animation: {
        "hbs-pulse": "hbs-pulse-slow 2s ease-in-out infinite",
        "hbs-scan":  "hbs-scan 4s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
