/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx,js,jsx}"],
  darkMode: ["class", ".puzzlely-dark"],
  plugins: [
    // eslint-disable-next-line max-len
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    require("@tailwindcss/line-clamp"),
  ],
  theme: {
    extend: {
      animation: {
        skeleton: "skeleton linear infinite alternate 800ms",
        "skeleton-fade": "fade 400ms",
      },

      borderColor: {
        DEFAULT: "hsl(var(--color-muted) / 0.2)",
      },

      boxShadow: {
        DEFAULT: "0 10px 30px -20px rgba(87, 82, 121, 0.2)",
      },

      colors: {
        base: "hsl(var(--color-base) / <alpha-value>)",
        overlay: "hsl(var(--color-overlay) / <alpha-value>)",
        surface: "hsl(var(--color-surface) / <alpha-value>)",

        muted: "hsl(var(--color-muted) / <alpha-value>)",
        subtle: "hsl(var(--color-subtle) / <alpha-value>)",
        text: "hsl(var(--color-text) / <alpha-value>)",

        blue: "hsl(var(--color-blue) / <alpha-value>)",
        cyan: "hsl(var(--color-cyan) / <alpha-value>)",
        green: "hsl(var(--color-green) / <alpha-value>)",
        magenta: "hsl(var(--color-magenta) / <alpha-value>)",
        red: "hsl(var(--color-red) / <alpha-value>)",
        yellow: "hsl(var(--color-yellow) / <alpha-value>)",
      },

      fontFamily: {
        body: ["InterVariable", "sans-serif"],
        heading: ["RalewayVariable", "sans-serif"],
        mono: [
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },

      keyframes: {
        skeleton: {
          from: {
            background: "hsl(var(--color-surface))",
            "border-color": "hsl(var(--color-surface))",
          },
          to: {
            background: "hsl(var(--color-muted) / 0.2)",
            "border-color": "hsl(var(--color-muted) / 0.2)",
          },
        },
        "skeleton-fade": {
          from: {
            opacity: 0,
          },
          to: {
            opacity: 1,
          },
        },
      },

      ringColor: {
        DEFAULT: "hsl(var(--color-muted) / 0.3)",
      },
    },
    screens: {
      sm: "480px",
      md: "768px",
      lg: "960px",
      xl: "1200px",
    },
  },
};
