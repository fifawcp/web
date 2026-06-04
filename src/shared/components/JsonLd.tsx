// Inert structured data. The real type is set only on the server so React doesn't warn about a
// <script> rendered during client navigation; suppressHydrationWarning covers the type swap. The
// `<` escape prevents a `</script>` breakout. Crawlers read the server HTML, which carries the
// correct `application/ld+json`.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type={typeof window === "undefined" ? "application/ld+json" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
