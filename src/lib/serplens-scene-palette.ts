/*
 * Three.js cannot consume CSS custom properties or OKLCH strings directly.
 * These are the sRGB projections of the matching SerpLens semantic tokens.
 */
export const serplensScenePalettes = {
  dark: {
    agentPrimary: "#5ac8c0",
    agentSecondary: "#7da1ff",
    agentAccent: "#d889ea",
    agentSurface: "#142725",
    agentBorder: "#244b47",
    background: "#0f0f0f",
    border: "#2a2a2a",
  },
  light: {
    agentPrimary: "#39827e",
    agentSecondary: "#3b6cdd",
    agentAccent: "#a63fbc",
    agentSurface: "#dff8f6",
    agentBorder: "#91e6e0",
    background: "#f5f5f4",
    border: "#e7e5e4",
  },
} as const;
