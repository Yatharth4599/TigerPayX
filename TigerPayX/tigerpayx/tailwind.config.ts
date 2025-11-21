import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
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
    },
  },
  plugins: [],
};

export default config;

