// Shim for react/compiler-runtime which doesn't exist in React 18
// Required for Sanity Studio v3 compatibility with Vite
export function c(size: number) {
  return new Array(size);
}
