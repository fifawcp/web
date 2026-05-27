export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-accent="neutral" className="contents">
      {children}
    </div>
  );
}
