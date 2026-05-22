export default function StandingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-accent="green" className="contents">
      {children}
    </div>
  );
}
