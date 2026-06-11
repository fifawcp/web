export default function BracketLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-accent="indigo" className="contents">
      {children}
    </div>
  );
}
