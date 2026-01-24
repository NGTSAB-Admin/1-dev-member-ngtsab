declare module 'react/compiler-runtime' {
  // Minimal typing for our runtime shim + dynamic import diagnostics.
  export function c(n: number): <T>(t: T) => T;
  export function create(n: number): <T>(t: T) => T;
  export function useMemoCache(size: number): unknown[];

  const _default: (n: number) => <T>(t: T) => T;
  export default _default;
}
