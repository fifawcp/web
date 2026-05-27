export default function BoardsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-accent="teal" className="contents">
      {children}
    </div>
  );
}
