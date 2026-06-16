import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Font Family
      fontFamily: {
        display: ["Space Grotesk", "Poppins", "sans-serif"], // futuristic headings
        sans: ["Inter", "Poppins", "system-ui", "sans-serif"], // body text
        poppins: ["Poppins", "sans-serif"],
      },
      // Extended Colors
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        // Custom Colors: USM brand + futuristic neon accents
        usmPurple: "#4B0082", // USM branding purple
        gold: "#FFD700", // brand gold
        dotted: "#F7C08A",
        brand: {
          violet: "#7C3AED",
          indigo: "#6366F1",
          fuchsia: "#C026D3",
          cyan: "#22D3EE",
          gold: "#FFD700",
        },
        ink: {
          900: "#0a0612", // deepest background
          800: "#140b24",
          700: "#1e1138",
        },
      },
      // Border Radius
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      // Layered, glowing shadows for the glass aesthetic
      boxShadow: {
        glass:
          "0 8px 32px -8px rgba(20, 8, 40, 0.45), inset 0 1px 0 0 rgba(255,255,255,0.08)",
        "glass-lg":
          "0 24px 60px -16px rgba(20, 8, 40, 0.6), inset 0 1px 0 0 rgba(255,255,255,0.10)",
        glow: "0 0 50px -12px rgba(124, 58, 237, 0.55)",
        "glow-gold": "0 0 45px -12px rgba(255, 215, 0, 0.5)",
        "glow-cyan": "0 0 45px -12px rgba(34, 211, 238, 0.55)",
      },
      // Custom Background Patterns & gradients
      backgroundImage: {
        "dotted-pattern":
          "radial-gradient(circle, rgba(255, 215, 0, 0.7) 1px, transparent 1px)",
        aurora:
          "radial-gradient(at 20% 20%, rgba(124,58,237,0.35) 0px, transparent 50%), radial-gradient(at 80% 10%, rgba(34,211,238,0.22) 0px, transparent 45%), radial-gradient(at 75% 80%, rgba(192,38,211,0.30) 0px, transparent 50%), radial-gradient(at 10% 85%, rgba(99,102,241,0.28) 0px, transparent 50%)",
        "grid-faint":
          "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
      },
      backgroundSize: {
        "dotted-spacing": "20px 20px",
        grid: "44px 44px",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "aurora-shift": {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(2%, -2%, 0) scale(1.08)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        "aurora-shift": "aurora-shift 16s ease-in-out infinite",
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        shimmer: "shimmer 2.5s linear infinite",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"), // Animation plugin
    require("tailwind-scrollbar-hide"), // Scrollbar hiding plugin
  ],
} satisfies Config;
