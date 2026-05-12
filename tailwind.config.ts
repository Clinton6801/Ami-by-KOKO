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
        // Àmì by Kòkò brand palette
        "amber-koko":      "#F59E0B", // Kòkò's warm amber — primary
        "green-ami":       "#166534", // Àmì's deep forest green — secondary
        "coral-celebrate": "#F43F5E", // Celebration accent
        "cream-bg":        "#FEFCE8", // Soft cream background
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body:    ["var(--font-body)",    "sans-serif"],
      },
      animation: {
        "koko-bounce": "bounce 0.6s ease-in-out infinite",
        "shard-glow":  "pulse 1.5s ease-in-out infinite",
      },
      minHeight: {
        tap: "48px", // minimum touch target
      },
      minWidth: {
        tap: "48px",
      },
    },
  },
  plugins: [],
};

export default config;
