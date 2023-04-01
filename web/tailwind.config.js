/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx,js,jsx}"],
  darkMode: ["class", ".puzzlely-dark"],
  plugins: [],
  theme: {
    extend: {
      animation: {
        accordionSlideDown:
          "accordionSlideDown 300ms cubic-bezier(0.87, 0, 0.13, 1)",
        accordionSlideUp:
          "accordionSlideUp 300ms cubic-bezier(0.87, 0, 0.13, 1)",
        skeleton: "skeleton linear infinite alternate 800ms",
        "skeleton-fade": "skeleton-fade 400ms",
        toasterEnter: "toasterEnter 200ms ease-out",
        toasterLeave: "toasterLeave 150ms ease-in forwards",
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
        accordionSlideDown: {
          from: {
            height: 0,
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        accordionSlideUp: {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: 0,
          },
        },
        skeleton: {
          from: {
            background: "hsl(var(--color-muted) / 0.2)",
            "border-color": "hsl(var(--color-surface))",
          },
          to: {
            background: "hsl(var(--color-muted) / 0.6)",
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
        toasterEnter: {
          "0%": {
            opacity: 0,
            transform: "scale(0.9)",
          },
          "100%": {
            opacity: 1,
            transform: "scale(1)",
          },
        },
        toasterLeave: {
          "0%": {
            opacity: 1,
            transform: "scale(1)",
          },
          "100%": {
            opacity: 0,
            transform: "scale(0.9)",
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
