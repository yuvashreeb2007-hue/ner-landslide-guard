/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        eoc: {
          bg: "#080c14",
          surface: "#0e1726",
          card: "#121d30",
          border: "#1e2f4a",
          highlight: "#1e3a5f",
          text: "#f1f5f9",
          muted: "#94a3b8",
          accent: "#0284c7",
          cyan: "#06b6d4",
          red: "#ef4444",
          orange: "#f97316",
          amber: "#f59e0b",
          green: "#10b981",
          purple: "#8b5cf6",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "Courier New", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "ping-slow": "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        radar: "radarSweep 4s linear infinite",
        ticker: "ticker 25s linear infinite",
      },
      keyframes: {
        radarSweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        ticker: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
      boxShadow: {
        "eoc-glow": "0 0 15px rgba(2, 132, 199, 0.25)",
        "eoc-critical": "0 0 20px rgba(239, 68, 68, 0.35)",
        "eoc-high": "0 0 20px rgba(249, 115, 22, 0.3)",
      },
    },
  },
  plugins: [],
};
