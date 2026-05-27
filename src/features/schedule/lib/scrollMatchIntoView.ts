export function scrollMatchIntoView(matchId: number, behavior: ScrollBehavior = "smooth"): void {
  // Get the match card by it's id
  const card = document.querySelector(`[data-match-id="${matchId}"]`);
  // Get the section that contains the match card
  const section = card?.closest("section");
  // Scroll the section into view
  section?.scrollIntoView({ behavior, block: "start" });
}
