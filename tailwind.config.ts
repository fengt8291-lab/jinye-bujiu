import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "sans-serif"
        ]
      },
      colors: {
        night: {
          950: "#030711",
          900: "#06101f",
          850: "#0a1629",
          800: "#101c33"
        },
        calm: {
          blue: "#7ea2ff",
          cyan: "#8dd7ff",
          mint: "#94e8c3",
          violet: "#ba9cff",
          amber: "#f1bd6b"
        }
      },
      boxShadow: {
        glow: "0 0 34px rgba(126, 162, 255, 0.32)",
        card: "0 20px 70px rgba(0, 0, 0, 0.34)"
      }
    }
  },
  plugins: []
};

export default config;
