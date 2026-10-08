// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// STATIC_EXPORT=1 (set by the GitHub Pages workflow) builds a plain static bundle:
// no server runtime needed, so any file host — including GitHub Pages — can serve it.
// Without that flag the build keeps Lovable's server output and the preview is unchanged.
const staticExport = process.env["STATIC_EXPORT"] === "1";

export default defineConfig({
  vite: {
    // GitHub Pages serves a project site from /<repository-name>/, so asset URLs
    // need that prefix. Any other host leaves BASE_PATH unset and uses "/".
    base: process.env["BASE_PATH"] || "/",
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    ...(staticExport ? { spa: { enabled: true } } : {}),
  },
  // "static" writes plain HTML/CSS/JS. Left out of a normal build so the config
  // package keeps its Cloudflare target for Lovable hosting.
  ...(staticExport ? { nitro: { preset: "static" } } : {}),
});
