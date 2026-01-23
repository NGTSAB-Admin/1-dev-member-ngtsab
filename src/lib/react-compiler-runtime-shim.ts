// Shim for react/compiler-runtime which doesn't exist in React 18
// Required for Sanity Studio v3 compatibility with Vite

export function c(size: number) {
  const $ = new Array(size);
  for (let i = 0; i < size; i++) {
    $[i] = Symbol.for("react.memo_cache_sentinel");
  }
  return $;
}

