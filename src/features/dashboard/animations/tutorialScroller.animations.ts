import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  container: HTMLElement;
  pinned: HTMLElement;
  texts: HTMLElement[];
  images: HTMLElement[];
  /** Scroll-down cue shown at the start; fades out during the first
   *  text-in so it stops drawing attention once the user is engaged. */
  scrollHint: HTMLElement | null;
  totalSteps: number;
};

/**
 * Choreography per step (scrubbed by scroll):
 *
 *   1. text-in   (TEXT_IN)   — slab rises from below the viewport,
 *                               translateY 60 → 0 + autoAlpha 0 → 1.
 *   2. text-out  (TEXT_OUT)  — slab slides up off the image, translateY
 *                               0 → -80 + autoAlpha 1 → 0.
 *   3. img-swap  (SWAP)      — outgoing image slides left + fades, the
 *                               next image slides in from the right.
 *                               Only between steps (skipped after the
 *                               last step's text-out).
 *
 * Timeline unit math:
 *   per step       = TEXT_IN + TEXT_OUT             (= 1.0)
 *   between steps  = SWAP                           (= 0.5)
 *   total          = N * 1.0 + (N-1) * 0.5         (= 8.5 for N=6)
 *
 * Pinned scroll budget is `totalUnits * VH_PER_UNIT` where 60 keeps the
 * scrub responsive (~510vh of scrolling for 6 steps, ~5 viewports). Bump
 * VH_PER_UNIT to slow it down, drop it for a snappier scrub.
 *
 * Respects `prefers-reduced-motion`: the pin and timeline are skipped
 * and the final step's text + image are rendered statically — the
 * tutorial is still readable, just without the scroll choreography.
 */
const TEXT_IN = 0.5;
const TEXT_OUT = 0.5;
const SWAP = 0.5;
/** Scroll budget allocated to fading the "scroll" cue out before step 1
 *  starts. Kept separate from `TEXT_IN` so the cue and the first text
 *  card don't share the same scroll window — the user reads the cue,
 *  scrolls, *then* step 1 rises. */
const HINT_OUT = 0.5;
const VH_PER_UNIT = 60;

export function tutorialScrollerAnimation({ container, pinned, texts, images, scrollHint, totalSteps }: Props) {
  if (totalSteps < 2 || texts.length < totalSteps || images.length < totalSteps) {
    return () => {};
  }

  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    // Show last step statically (image + slab visible at their rest pose).
    gsap.set(texts.slice(0, -1), { autoAlpha: 0 });
    gsap.set(images.slice(0, -1), { autoAlpha: 0 });
    gsap.set([texts[texts.length - 1], images[images.length - 1]], { autoAlpha: 1, y: 0, x: 0 });
    if (scrollHint) gsap.set(scrollHint, { autoAlpha: 0 });
    return () => {};
  }

  const ctx = gsap.context(() => {
    // Initial state: only image[0] visible; all slabs sit below the
    // viewport waiting to rise.
    gsap.set(images[0], { autoAlpha: 1, x: 0 });
    gsap.set(images.slice(1), { autoAlpha: 0, xPercent: 12 });
    gsap.set(texts, { autoAlpha: 0, yPercent: 100 });

    const totalUnits = (scrollHint ? HINT_OUT : 0) + totalSteps * (TEXT_IN + TEXT_OUT) + (totalSteps - 1) * SWAP;

    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: `+=${Math.round(totalUnits * VH_PER_UNIT)}%`,
        pin: pinned,
        pinSpacing: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    // Phase 0 — fade the scroll cue out. Reserves `HINT_OUT` units of
    // scroll for itself; step 1's text-in only starts after the cue is
    // gone, so the two transitions never overlap.
    let cursor = 0;
    if (scrollHint) {
      tl.to(scrollHint, { autoAlpha: 0, duration: HINT_OUT, ease: "power2.in" }, cursor);
      cursor += HINT_OUT;
    }

    for (let i = 0; i < totalSteps; i++) {
      // 1. Text slab rises into view over the current image.
      tl.to(texts[i], { autoAlpha: 1, yPercent: 0, duration: TEXT_IN, ease: "power3.out" }, cursor);
      cursor += TEXT_IN;

      // 2. Text slab slides up and out, leaving the image clear before
      //    the swap. Uses translateY (not yPercent) so the exit reads
      //    consistently regardless of how tall the slab's content is.
      tl.to(texts[i], { autoAlpha: 0, y: -120, duration: TEXT_OUT, ease: "power2.in" }, cursor);
      cursor += TEXT_OUT;

      // 3. Crossfade-translate to the next image. Skipped on the final
      //    step — there's no "next" to swap to.
      if (i < totalSteps - 1) {
        tl.to(images[i], { autoAlpha: 0, xPercent: -12, duration: SWAP, ease: "power2.in" }, cursor);
        tl.to(images[i + 1], { autoAlpha: 1, xPercent: 0, duration: SWAP, ease: "power2.out" }, cursor);
        cursor += SWAP;
      }
    }
  }, container);

  return () => ctx.revert();
}
