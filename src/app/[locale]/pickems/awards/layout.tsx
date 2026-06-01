/**
 * Awards is nested under /pickems so it inherits the pickems route's accent
 * (indigo) and chrome — it reads as part of the same feature family.
 *
 * The parent pickems layout reserves mobile bottom padding for its sticky CTA
 * bar (`--pickems-cta-height`). Awards uses an in-flow action bar instead, so
 * we neutralize that reserved space here to avoid a phantom gap on mobile.
 */
export default function AwardsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`@media (max-width: 1023.98px){body{--pickems-cta-height:0px}}`}</style>
      {children}
    </>
  );
}
