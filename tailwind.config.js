/** @type {import('tailwindcss').Config} */
module.exports = {
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
        primary: "#1DB954",
        secondary: "#191414",
        surface: "#121212",
        "surface-hover": "#282828",
        accent: "#38BDF8",
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "ui-sans-serif", "system-ui"],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'playing-bar': 'playing-bar 1s ease-in-out infinite',
      },
      keyframes: {
        'playing-bar': {
          '0%, 100%': { height: '4px' },
          '50%': { height: '16px' },
        }
      }
    },
  },
  plugins: [],
};
