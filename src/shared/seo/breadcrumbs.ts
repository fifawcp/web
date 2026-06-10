export function buildBreadcrumbJsonLd(items: Array<{ name: string; url: string }>, _: string): Record<string, unknown> {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map(({ name, url }, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: url,
    })),
  };
}
