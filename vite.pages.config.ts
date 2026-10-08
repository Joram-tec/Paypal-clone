// Build config used by `npm run build:pages` (the GitHub Pages deploy).
//
// It compiles the same wallet screens into plain HTML/CSS/JS inside dist/.
// No server runtime is needed, which is what a file host like GitHub Pages
// requires. The normal `npm run build` (used by Lovable) is untouched.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  root: "pages",
  // GitHub Pages serves a project site from /<repository-name>/, so asset URLs
  // need that prefix. Set BASE_PATH in CI; leave it unset for a root-domain host.
  base: process.env["BASE_PATH"] || "/",
  plugins: [react(), tailwindcss()],
  publicDir: "../public",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
