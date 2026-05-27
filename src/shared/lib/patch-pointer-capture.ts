let patched = false;

/**
 * Idempotent workaround for a vaul ≤ 1.1.2 bug: on mobile, `releasePointerCapture`
 * fires after the pointer is already gone, throwing a `NotFoundError`
 * (draggable.tsx:185). Wrapping it once swallows that specific failure.
 *
 * Safe to call from multiple component mounts — the patch is applied at most once
 * and is never reverted, so it cannot capture an already-patched function.
 */
export function patchReleasePointerCapture() {
  if (patched || typeof Element === "undefined") return;
  patched = true;

  const original = Element.prototype.releasePointerCapture;
  Element.prototype.releasePointerCapture = function (pointerId: number) {
    try {
      original.call(this, pointerId);
    } catch {
      // Pointer was already released — safe to ignore.
    }
  };
}
