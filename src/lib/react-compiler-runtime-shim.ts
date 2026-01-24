// Shim for react/compiler-runtime required by Sanity Studio v3
// This prevents build errors when Sanity dependencies try to import this non-existent module

export function c(n: number) {
  return function (t: unknown) {
    return t;
  };
}

export default { c };
