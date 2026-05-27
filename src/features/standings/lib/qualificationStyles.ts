import type { QualificationStatus } from "../types/standings.types";

/**
 * Tailwind background class for the 4-px left indicator cell that encodes a team's
 * qualification status. Uses the page accent (green on Standings) at full strength
 * for a guaranteed R32 spot and a faded tint for the provisional third-place
 * playoff. Returns transparent for eliminated teams so the cell collapses
 * visually but keeps the table grid aligned.
 */
export function getQualificationBarClass(status: QualificationStatus): string {
  switch (status) {
    case "advances_to_r32":
      return "bg-page-accent";
    case "best_third_playoff":
      return "bg-page-accent/35";
    case "eliminated":
    default:
      return "bg-transparent";
  }
}
