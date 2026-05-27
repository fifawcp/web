export default function RulesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-accent="neutral" className="contents">
      {children}
    </div>
  );
}
