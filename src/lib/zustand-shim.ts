// Zustand interop shim for Vite + Sanity.
//
// In some pre-bundling / CJS interop scenarios, importing `zustand` can end up
// exposing only a `default` export at runtime, making `import { create } from 'zustand'`
// resolve to `undefined`.
//
// Sanity Studio expects `create` to be a named export, so we force it to exist.

// Import the real ESM entry by file path to bypass `zustand` package export maps.
// We cannot use `zustand/esm/index.mjs` because it's not a public export.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - .mjs has no TS typings in this path, but Vite can bundle it.
import * as real from '../../../node_modules/zustand/esm/index.mjs';

// Re-export vanilla helpers exactly like Zustand does.
export * from 'zustand/vanilla';

export const useStore = (real as any).useStore;

// Ensure `create` is available as a named export.
// Prefer ESM named export; otherwise fall back to property on default export.
export const create =
  (real as any).create ??
  ((real as any).default && (real as any).default.create) ??
  ((real as any).default as any);

// Keep default export behavior compatible.
const defaultExport = (real as any).default;
export default defaultExport;
