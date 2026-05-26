"use client";

import { useIsMobile } from "./useMediaQuery";

/**
 * Mobile keyboards that pop open on dialog mount shove the modal up and hide its
 * first step. Suppress autofocus on mobile (let the user tap in deliberately),
 * keep it on desktop. Spread `onOpenAutoFocus` on the `DialogContent` and
 * `autoFocus` on the field that would otherwise grab focus.
 */
export function useAutoFocusUnlessMobile() {
  const isMobile = useIsMobile();
  return {
    autoFocus: !isMobile,
    onOpenAutoFocus: (event: Event) => {
      if (isMobile) event.preventDefault();
    },
  };
}
