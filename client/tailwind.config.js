/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      screens: {
        xs: '420px',
      },
      colors: {
        // UdaanHer: Giving women wings to fly Design System Tokens (India)
        primary: "#EA3C36",
        "primary-hover": "#D32F2F",
        "primary-dark": "#C92A25",
        "primary-light": "#FFF1F0",
        "on-primary": "#ffffff",
        "primary-container": "#D32F2F",
        "on-primary-container": "#ffffff",
        "inverse-primary": "#FEE2E2",

        // Secondary Accents (Cyan/Teal from First Aid card & Navy from Youth card)
        secondary: "#00A3C4",
        "on-secondary": "#ffffff",
        "secondary-container": "#E0F2FE",
        "on-secondary-container": "#0369A1",

        tertiary: "#1E3A8A",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#DBEAFE",
        "on-tertiary-container": "#1E40AF",

        // Clean White & Neutral Surfaces
        surface: "#ffffff",
        "surface-dim": "#f3f4f6",
        "surface-bright": "#ffffff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f8f9fa",
        "surface-container": "#f3f4f6",
        "surface-container-high": "#e5e7eb",
        "surface-container-highest": "#d1d5db",
        "surface-variant": "#f3f4f6",

        "on-surface": "#1a1a1a",
        "on-surface-variant": "#4b5563",
        "inverse-surface": "#1a1a1a",
        "inverse-on-surface": "#ffffff",

        // Borders & Outlines
        outline: "#e5e7eb",
        "outline-variant": "#d1d5db",
        "surface-tint": "#EA3C36",

        // Status & Alerts
        error: "#dc2626",
        "on-error": "#ffffff",
        "error-container": "#fee2e2",
        "on-error-container": "#991b1b",

        // Tints
        "primary-fixed": "#fee2e2",
        "primary-fixed-dim": "#fecaca",
        "on-primary-fixed": "#7f1d1d",
        "on-primary-fixed-variant": "#991b1b",
        "secondary-fixed": "#e0f2fe",
        "secondary-fixed-dim": "#bae6fd",
        "on-secondary-fixed": "#0c4a6e",
        "on-secondary-fixed-variant": "#0369a1",
        "tertiary-fixed": "#dbeafe",
        "tertiary-fixed-dim": "#bfdbfe",
        "on-tertiary-fixed": "#172554",
        "on-tertiary-fixed-variant": "#1e40af",

        background: "#ffffff",
        "on-background": "#1a1a1a",

        // Dark theme tokens for Footer & Dark Bars
        dark: {
          bg: "#1a1a1a",
          card: "#222326",
          border: "#2e3034",
          text: "#ffffff",
          muted: "#9ca3af",
        },

        // Backward-compatibility mapping with Red Cross palette
        brand: {
          primary: "#EA3C36",
          deep: "#D32F2F",
          sage: "#FFF1F0",
          bg: "#FFFFFF",
          surface: "#FFFFFF",
          text: "#1A1A1A",
          muted: "#4B5563",
          terracotta: "#EA3C36",
          "terracotta-dark": "#C92A25",
          "sage-light": "#F8F9FA",
          border: "#E5E7EB",
          cyan: "#00A3C4",
          navy: "#1E3A8A",
        },
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        sans: ["Poppins", "Noto Sans Devanagari", "sans-serif"],
        serif: ["Poppins", "sans-serif"],
        editorial: ["Poppins", "sans-serif"],
        hindi: ["Noto Sans Devanagari", "Poppins", "sans-serif"],
        "display-hero": ["Poppins", "sans-serif"],
        "display-hero-mobile": ["Poppins", "sans-serif"],
        "headline-lg": ["Poppins", "sans-serif"],
        "headline-lg-mobile": ["Poppins", "sans-serif"],
        "headline-md": ["Poppins", "sans-serif"],
        "headline-sm": ["Poppins", "sans-serif"],
        "title-md": ["Poppins", "sans-serif"],
        "body-lg": ["Poppins", "Noto Sans Devanagari", "sans-serif"],
        "body-md": ["Poppins", "Noto Sans Devanagari", "sans-serif"],
        "body-sm": ["Poppins", "Noto Sans Devanagari", "sans-serif"],
        "label-caps": ["Poppins", "sans-serif"],
        "label-md": ["Poppins", "sans-serif"],
        "label-sm": ["Poppins", "sans-serif"],
      },
      fontSize: {
        "display-hero": [
          "52px",
          { lineHeight: "60px", letterSpacing: "-0.025em", fontWeight: "700" },
        ],
        "display-hero-mobile": [
          "34px",
          { lineHeight: "42px", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        "headline-lg": [
          "36px",
          { lineHeight: "44px", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        "headline-lg-mobile": [
          "26px",
          { lineHeight: "34px", letterSpacing: "-0.015em", fontWeight: "700" },
        ],
        "headline-md": [
          "28px",
          { lineHeight: "36px", letterSpacing: "-0.015em", fontWeight: "700" },
        ],
        "headline-sm": [
          "22px",
          { lineHeight: "28px", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        "title-md": [
          "18px",
          { lineHeight: "24px", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        "body-lg": [
          "17px",
          { lineHeight: "26px", letterSpacing: "0em", fontWeight: "400" },
        ],
        "body-md": [
          "15px",
          { lineHeight: "22px", letterSpacing: "0em", fontWeight: "400" },
        ],
        "body-sm": [
          "13px",
          { lineHeight: "19px", letterSpacing: "0em", fontWeight: "400" },
        ],
        "label-caps": [
          "12px",
          { lineHeight: "16px", letterSpacing: "0.08em", fontWeight: "700" },
        ],
        "label-md": [
          "14px",
          { lineHeight: "20px", letterSpacing: "0em", fontWeight: "500" },
        ],
        "label-sm": [
          "12px",
          { lineHeight: "16px", letterSpacing: "0em", fontWeight: "500" },
        ],
      },
      spacing: {
        gutter: "1.5rem",
        "gutter-mobile": "1rem",
        margin: "3rem",
        "margin-mobile": "1.25rem",
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2.5rem",
      },
      borderRadius: {
        card: "12px",
        btn: "8px",
        "2xl": "16px",
        "3xl": "20px",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        soft: "0 2px 8px -2px rgba(0, 0, 0, 0.06), 0 4px 16px -4px rgba(0, 0, 0, 0.04)",
        elevated:
          "0 8px 24px -6px rgba(0, 0, 0, 0.08), 0 16px 32px -8px rgba(0, 0, 0, 0.06)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 4px 12px -2px rgba(0, 0, 0, 0.05)",
        "card-hover":
          "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.06)",
        "glow-primary": "0 0 24px -4px rgba(234, 60, 54, 0.3)",
        "inner-soft": "inset 0 1px 2px rgba(0, 0, 0, 0.04)",
        "inner-highlight": "inset 0 1px 0 rgba(255, 255, 255, 0.2)",
      },
      animation: {
        fadeIn: "fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        slideUp: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        float: "float 4.5s ease-in-out infinite",
        "pulse-slow": "pulseSlow 3s ease-in-out infinite",
        shimmer: "shimmer 2.2s infinite linear",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pulseSlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
