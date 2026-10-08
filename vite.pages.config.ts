// Build config used by `npm run build:pages` (the GitHub Pages deploy).
//
// It compiles the same wallet screens into plain HTML/CSS/JS inside dist/.
// No server runtime is needed, which is what a file host like GitHub Pages
// requires. The normal `npm run build` (used by Lovable) is untouched.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  root: "pages",
  // Keep the default aligned with the install URL in public/manifest.json.
  base: process.env["BASE_PATH"] || "/Paypal-clone/",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      manifest: false,
      injectRegister: "script",
      includeAssets: ["favicon.ico", "manifest.json", "icons/*.png"],
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,ico,woff,woff2}"],
        cleanupOutdatedCaches: true,
        // Activate updates after the app closes, never during a wallet interaction.
        skipWaiting: false,
        clientsClaim: true,
      },
    }),
  ],
  publicDir: "../public",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
