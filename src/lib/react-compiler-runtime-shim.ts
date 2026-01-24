// Shim for `react/compiler-runtime`.
//
// Some Sanity Studio builds (and other deps) import `react/compiler-runtime` and
// expect exports that only exist when the React Compiler runtime is available.
// React 18 doesn't ship these APIs, so we provide minimal, safe fallbacks.
//
// Goal: prevent runtime crashes like `create is not a function` or
// `useMemoCache is not a function` in production bundles.

/**
 * In compiled output, React may import `c()` from compiler-runtime.
 * We return an identity wrapper which keeps the value stable.
 */
export function c(_n: number) {
  return function <T>(t: T): T {
    return t;
  };
}

/**
 * Some builds refer to `create()` instead of `c()`.
 * Alias it to the same identity behavior.
 */
export function create(n: number) {
  return c(n);
}

/**
 * React Compiler can use `useMemoCache(size)` internally.
 * React 18's dispatcher doesn't expose it, so we provide a simple array cache.
 * This is sufficient to keep dependent libraries from crashing.
 */
export function useMemoCache(size: number) {
  // Keep it deterministic and non-throwing.
  return Array.from({ length: Math.max(0, size) });
}

/**
 * Some compiled bundles import the *default* export and call it as a function.
 * Provide a callable default export that behaves like `create()`/`c()`.
 */
function compilerRuntimeDefault(n: number) {
  return c(n);
}

// Attach named exports onto the callable default for maximum interop.
(compilerRuntimeDefault as any).c = c;
(compilerRuntimeDefault as any).create = create;
(compilerRuntimeDefault as any).useMemoCache = useMemoCache;

export default compilerRuntimeDefault;
