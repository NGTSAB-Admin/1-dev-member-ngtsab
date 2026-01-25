// History shim
//
// Goal: make `import { createBrowserHistory } from 'history'` reliable under Vite
// pre-bundling + ESM/CJS interop (Sanity Studio is particularly sensitive).
//
// We prefer the package's ESM entry, but defensively fall back to `default`.

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite will resolve this via our config; types come from `history`.
import * as real from 'history';

type AnyRecord = Record<string, any>;

function pickFn<T extends Function>(mod: AnyRecord, name: string): T {
  const direct = mod?.[name];
  const fromDefault = mod?.default?.[name];
  const candidate = direct ?? fromDefault;
  if (typeof candidate !== 'function') {
    throw new TypeError(
      `[history-shim] Expected ${name} to be a function, got ${typeof candidate}`
    );
  }
  return candidate as unknown as T;
}

export const createBrowserHistory = pickFn<typeof import('history').createBrowserHistory>(
  real as AnyRecord,
  'createBrowserHistory'
);

export const createHashHistory = pickFn<typeof import('history').createHashHistory>(
  real as AnyRecord,
  'createHashHistory'
);

export const createMemoryHistory = pickFn<typeof import('history').createMemoryHistory>(
  real as AnyRecord,
  'createMemoryHistory'
);

// Re-export common types/constants if available (best effort).
export const Action = (real as AnyRecord).Action ?? (real as AnyRecord).default?.Action;
export const parsePath = (real as AnyRecord).parsePath ?? (real as AnyRecord).default?.parsePath;
export const createPath = (real as AnyRecord).createPath ?? (real as AnyRecord).default?.createPath;

export default {
  ...(real as AnyRecord),
  createBrowserHistory,
  createHashHistory,
  createMemoryHistory,
};
