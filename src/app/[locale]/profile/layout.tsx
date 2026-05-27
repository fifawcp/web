export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  // Purple is unused by every other top-level route (schedule=blue, pickems=blue,
  // standings=green, neutral=home). It reads as "personal/account" without
  // competing with the lime success accent used app-wide.
  return (
    <div data-accent="purple" className="contents">
      {children}
    </div>
  );
}
