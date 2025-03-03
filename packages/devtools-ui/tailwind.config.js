const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["src/**/*.{ts,tsx}"],
    prefix: "re-",
    theme: {
        extend: {
            screens: {
                large: { min: "960px" },
                tall: {
                    raw: "(min-height: 670px)",
                },
            },
            boxShadow: {
                "monitor-filters": "0px 16px 32px 16px rgba(0, 0, 0, 0.75)",
            },
            animation: {
                "pulse-spin": "pulse-spin 2.5s ease-in-out infinite",
            },
            keyframes: {
                "pulse-spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "10%": { transform: "rotate(0deg)" },
                    "40%": { transform: "rotate(180deg)" },
                    "60%": { transform: "rotate(180deg)" },
                    "90%": { transform: "rotate(360deg)" },
                    "100%": { transform: "rotate(360deg)" },
                },
            },
            backgroundImage: {
                "feed-item-featured":
                    "radial-gradient(26.38% 26.38% at 100% 0%, rgba(237, 94, 201, 0.33) 0%, rgba(237, 94, 201, 0.00) 100%), linear-gradient(180deg, #1D1E30 0%, rgba(29, 30, 48, 0.00) 100%)",
                "feed-item-new":
                    "radial-gradient(41.75% 41.75% at 100% 0%, rgba(71, 235, 235, 0.20) 0%, rgba(71, 235, 235, 0.00) 100%), linear-gradient(180deg, #1D1E30 0%, rgba(29, 30, 48, 0.00) 100%)",
                "package-item-has-updates":
                    "radial-gradient(43.74% 43.74% at 100% 0%, rgba(110, 179, 247, 0.20) 0%, rgba(110, 179, 247, 0.00) 100%), linear-gradient(180deg, #1D1E30 0%, rgba(29, 30, 48, 0.00) 100%)",
                "project-id-warning":
                    "radial-gradient(48.67% 50.06% at 2.36% 50%, rgba(255, 76, 77, 0.25) 0%, rgba(255, 76, 77, 0.00) 100%), linear-gradient(90deg, rgba(255, 76, 77, 0.20) 0%, rgba(255, 76, 77, 0.00) 100%)",
                "project-id-success":
                    "radial-gradient(48.67% 50.06% at 2.36% 50%, rgba(38, 217, 127, 0.25) 0%, rgba(38, 217, 127, 0.00) 100%), linear-gradient(90deg, rgba(38, 217, 127, 0.10) 0%, rgba(38, 217, 127, 0.00) 100%)",
                "project-id-loading":
                    "radial-gradient(48.67% 50.06% at 2.36% 50%, rgba(110, 179, 247, 0.25) 0%, rgba(110, 179, 247, 0.00) 100%), linear-gradient(90deg, rgba(110, 179, 247, 0.10) 0%, rgba(110, 179, 247, 0.00) 100%)",
            },
            fontFamily: {
                sans: ["Inter", ...defaultTheme.fontFamily.sans],
            },
            colors: {
                gray: {
                    0: "#ffffff",
                    50: "#F4F8FB",
                    100: "#EDF2F7",
                    200: "#DEE5ED",
                    300: "#CFD7E2",
                    400: "#A3ADC2",
                    500: "#6C7793",
                    600: "#474E6B",
                    700: "#303450",
                    800: "#1D1E30",
                    900: "#14141F",
                    1000: "#0A0A15",
                },
                brand: {
                    blue: "#0080FF",
                },
                alt: {
                    blue: "#6EB3F7",
                    cyan: "#47EBEB",
                    green: "#26D97F",
                    red: "#FF4C4D",
                    yellow: "#FFBF00",
                    pink: "#ED5EC9",
                },
            },
        },
    },
    plugins: [require("@tailwindcss/typography")],
};
