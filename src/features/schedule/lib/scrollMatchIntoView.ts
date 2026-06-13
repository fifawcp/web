export function scrollMatchIntoView(matchId: number, behavior: ScrollBehavior = "smooth"): void {
  // Scroll the specific match card (not its date section) so a match deep inside a
  // group still lands in view. The card carries scroll-mt-(--schedule-scroll-offset),
  // so scrollIntoView clears the sticky header + filter bar.
  const card = document.querySelector(`[data-match-id="${matchId}"]`);
  card?.scrollIntoView({ behavior, block: "start" });
}
