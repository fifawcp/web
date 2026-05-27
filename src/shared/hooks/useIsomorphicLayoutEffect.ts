import { useEffect, useLayoutEffect } from "react";

/**
 * `useLayoutEffect` on the client, `useEffect` on the server.
 *
 * For code that needs to read from localStorage or commit a state change
 * before the browser's next paint. `useEffect` runs *after* paint, which —
 * combined with `useHydrated`'s `useSyncExternalStore` re-render — can flush
 * the real content with un-drafted state before the localStorage layer-on
 * happens. Wrapping it like this also avoids React's "useLayoutEffect does
 * nothing on the server" warning.
 */
export const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
