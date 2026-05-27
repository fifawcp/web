type PlaceholderPageProps = {
  /** Small uppercase eyebrow above the title (e.g. "Coming soon"). */
  eyebrow: string;
  title: string;
  body: string;
};

/** Neutral centered shell for routes that exist but aren't built out yet. */
export function PlaceholderPage({ eyebrow, title, body }: PlaceholderPageProps) {
  return (
    <section className="container mx-auto flex min-h-[55vh] flex-col items-center justify-center gap-4 px-4 py-20 text-center sm:px-6 lg:px-8">
      <span className="rounded-lg border border-border bg-muted px-2.5 py-1 text-2xs font-medium uppercase tracking-wider text-muted-foreground">{eyebrow}</span>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{body}</p>
    </section>
  );
}
