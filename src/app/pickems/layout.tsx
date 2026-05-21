export default function PickemsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-accent="blue" className="contents">
      {children}
    </div>
  );
}
