type BallTargetProps = {
  className?: string;
  size?: number;
};

/**
 * Composite reticle icon: a Lucide-style ring framing a soccer ball, with
 * cardinal ticks that bridge from the canvas edge through the ring down to
 * the ball edge.
 *
 * Layering, inside out (in 0 0 24 24 viewBox coords):
 *  - Ball: ≈r5 (10/194 scale of the original 194×194 ball SVG)
 *  - Ring: r=8 (Locate's and Crosshair's circles matched at the same radius)
 *  - Ticks: four marks at cardinal positions, each made of two segments —
 *           Locate's outer (canvas → ring, length 2) + Crosshair's inner
 *           (ring → toward ball, length 1.5). They meet at the ring edge
 *           and read as one continuous tick crossing the ring.
 *
 * Stroke width is 1.5 (thinner than Lucide's default 2) to keep the icon
 * legible at small sizes without dominating the ball.
 *
 * Both rings stroke with `currentColor` so the reticle inherits text color.
 * The ball's pattern paints in `fill-primary` so on a `bg-primary` chip the
 * pattern visually merges with the background (reads as cut-outs).
 */
export function BallTarget({ className, size = 24 }: BallTargetProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} role="img" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
        {/* Shared ring at r=8 (Locate + Crosshair circles matched). */}
        <circle cx="12" cy="12" r="8" />

        {/* Locate's outer ticks — length 2, attached to ring, extending out. */}
        <line x1="2" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="22" y2="12" />
        <line x1="12" y1="2" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="22" />

        {/* Crosshair's inner ticks — length 1.5, attached to ring, extending in. */}
        <line x1="4" y1="12" x2="5.5" y2="12" />
        <line x1="18.5" y1="12" x2="20" y2="12" />
        <line x1="12" y1="4" x2="12" y2="5.5" />
        <line x1="12" y1="18.5" x2="12" y2="20" />
      </g>

      {/* Soccer ball — original 194×194 SVG paths, scaled to a 10×10 cell at (7, 7).
          Disc fills with `currentColor` (so it follows the parent text color);
          the pentagon pattern is hardcoded white, matching the canonical look
          of a real soccer ball regardless of the surrounding theme. */}
      <g transform="translate(7 7) scale(0.0515)">
        <circle fill="currentColor" cx="97" cy="97" r="97" />
        <path
          fill="#ffffff"
          d="m 94,9.2 a 88,88 0 0 0 -55,21.8 l 27,0 28,-14.4 0,-7.4 z m 6,0 0,7.4 28,14.4 27,0 a 88,88 0 0 0 -55,-21.8 z m -67.2,27.8 a 88,88 0 0 0 -20,34.2 l 16,27.6 23,-3.6 21,-36.2 -8.4,-22 -31.6,0 z m 96.8,0 -8.4,22 21,36.2 23,3.6 15.8,-27.4 a 88,88 0 0 0 -19.8,-34.4 l -31.6,0 z m -50,26 -20.2,35.2 17.8,30.8 39.6,0 17.8,-30.8 -20.2,-35.2 -34.8,0 z m -68.8,16.6 a 88,88 0 0 0 -1.8,17.4 88,88 0 0 0 10.4,41.4 l 7.4,-4.4 -1.4,-29 -14.6,-25.4 z m 172.4,0.2 -14.6,25.2 -1.4,29 7.4,4.4 a 88,88 0 0 0 10.4,-41.4 88,88 0 0 0 -1.8,-17.2 z m -106,57.2 -15.4,19 L 77.2,182.6 a 88,88 0 0 0 19.8,2.4 88,88 0 0 0 19.8,-2.4 l 15.4,-26.6 -15.4,-19 -39.6,0 z m -47.8,2.6 -7,4 A 88,88 0 0 0 68.8,180.4 l -14,-24.6 -25.4,-16.2 z m 135.2,0 -25.4,16.2 -14,24.4 a 88,88 0 0 0 46.4,-36.6 l -7,-4 z"
        />
      </g>
    </svg>
  );
}
