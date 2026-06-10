import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#6366F1",
          secondary: "#8B5CF6",
          accent: "#06B6D4",
          success: "#10B981",
          danger: "#EF4444",
          ink: "#F8FAFC",
          night: "#0F172A",
          panel: "#111827"
        }
      },
      boxShadow: {
        glow: "0 20px 80px rgba(99,102,241,.28)",
        glass: "0 18px 60px rgba(0,0,0,.28)"
      }
    }
  },
  plugins: []
};

export default config;
