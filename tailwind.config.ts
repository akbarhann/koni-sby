
import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                koni: {
                    red: "#B8161C",    // Primary
                    gold: "#FFC72C",   // Secondary
                    dark: "#212121",   // Neutral Dark (Text)
                    light: "#F4F4F4",  // Neutral Light (Background)
                    white: "#FFFFFF",  // Base White
                },
                // Semantic Colors (Status System)
                status: {
                    success: "#16A34A", // Green-600 (Verified)
                    error: "#DC2626",   // Red-600 (Rejected)
                    warning: "#D97706", // Amber-600 (Pending)
                    info: "#2563EB",    // Blue-600 (Draft)
                }
            },
        },
    },
    plugins: [],
};
export default config;
