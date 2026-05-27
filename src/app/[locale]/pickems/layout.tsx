export default function PickemsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-accent="indigo" className="contents">
      {/* Route-scoped offsets so the mobile CTA bar doesn't sit on top of the
          global footer or sonner toasts. The bar measures itself and writes
          --pickems-cta-height on <body>, so padding matches the bar exactly
          (no gap below the footer). The static fallback covers the first paint
          before the effect runs and the locked-state case (no bar rendered). */}
      <style>{`
        @media (max-width: 1023.98px) {
          body { padding-bottom: var(--pickems-cta-height, calc(7rem + env(safe-area-inset-bottom))); }
          [data-sonner-toaster][data-y-position="bottom"] {
            bottom: var(--pickems-cta-height, calc(7rem + env(safe-area-inset-bottom))) !important;
          }
        }
      `}</style>
      {children}
    </div>
  );
}
