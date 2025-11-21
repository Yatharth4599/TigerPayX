import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Safelist to ensure critical classes are always included
  safelist: [
    // Custom color classes with brackets
    'via-[#1a0a00]',
    'from-[#ff6b00]',
    'bg-[#ff6b00]',
    'bg-[#1a0a00]',
    // Custom tracking
    'tracking-[0.2em]',
    // Custom grid columns
    'lg:grid-cols-[0.9fr,1.1fr]',
    'lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]',
    // Custom rounded
    'rounded-[999px]',
    // Custom shadows
    'shadow-[0_0_12px_rgba(255,107,0,0.9)]',
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "tiger-orange": "var(--tiger-orange)",
        "tiger-deep": "var(--tiger-deep)",
        "tiger-soft": "var(--tiger-soft)",
        "tiger-muted": "var(--tiger-muted)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
  // Ensure all utilities are included
  corePlugins: {
    preflight: true,
  },
};

export default config;

