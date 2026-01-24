import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  // Ensure Sanity (and Vite pre-bundled deps) always resolve the React Compiler runtime
  // to our shim when running on React 18.
  optimizeDeps: {
    // If esbuild pre-bundles a module that references react/compiler-runtime before
    // aliasing kicks in, it can lock in the wrong resolution.
    exclude: ["react/compiler-runtime"],
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Shim for Sanity Studio v3 compatibility with React 18
      "react/compiler-runtime": path.resolve(
        __dirname,
        "./src/lib/react-compiler-runtime-shim.ts"
      ),
      // Some bundles append an extension.
      "react/compiler-runtime.js": path.resolve(
        __dirname,
        "./src/lib/react-compiler-runtime-shim.ts"
      ),
    },
  },
}));
