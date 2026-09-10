/*
 * Three.js cannot consume CSS custom properties or OKLCH strings directly.
 * These are the sRGB projections of the matching SerpLens semantic tokens.
 */
export const serplensScenePalettes = {
  dark: {
    agentPrimary: "#ebebeb",
    agentSecondary: "#ffffff",
    agentAccent: "#a3a3a3",
    agentSurface: "#343434",
    agentBorder: "#737373",
    background: "#0f0f0f",
    border: "#2a2a2a",
  },
  light: {
    agentPrimary: "#171717",
    agentSecondary: "#ffffff",
    agentAccent: "#525252",
    agentSurface: "#e5e5e5",
    agentBorder: "#a3a3a3",
    background: "#f5f5f4",
    border: "#e7e5e4",
  },
} as const;
