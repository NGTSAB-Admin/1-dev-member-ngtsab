import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const compilerRuntimeShimPath = path.resolve(
  __dirname,
  "./src/lib/react-compiler-runtime-shim.ts"
);

/**
 * Force all `react/compiler-runtime*` imports (including optimizeDeps / prebundled deps)
 * to resolve to our local shim. This is more reliable than alias alone.
 */
function reactCompilerRuntimeShimPlugin() {
  return {
    name: "react-compiler-runtime-shim-plugin",
    enforce: "pre" as const,
    resolveId(id: string) {
      if (id === "react/compiler-runtime" || id === "react/compiler-runtime.js") {
        return compilerRuntimeShimPath;
      }
      if (id.startsWith("react/compiler-runtime/")) {
        return compilerRuntimeShimPath;
      }
      return null;
    },
  };
}

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
    exclude: ["react/compiler-runtime", "react/compiler-runtime.js"],

    // Sanity Studio pulls in zustand. In some Vite optimizeDeps scenarios,
    // named exports (like `create`) can become undefined unless we force interop.
    // This avoids brittle deep-import aliases like `zustand/esm` (not exported in all builds).
    needsInterop: ["zustand"],
  },
  plugins: [
    reactCompilerRuntimeShimPlugin(),
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./src") },

      // Shim for Sanity Studio v3 compatibility with React 18.
      // IMPORTANT: Sanity bundles can reference several variants (with extension, with subpaths).
      // We force all of them to resolve to the same shim.
      {
        find: /^react\/compiler-runtime(?:\.js)?$/,
        replacement: compilerRuntimeShimPath,
      },
      {
        find: /^react\/compiler-runtime\/.*/,
        replacement: compilerRuntimeShimPath,
      },
    ],
  },
}));
