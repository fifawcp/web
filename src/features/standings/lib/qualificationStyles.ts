import type { QualificationStatus } from "../types/standings.types";

/**
 * Tailwind background class for the 4-px left indicator cell that encodes a team's
 * qualification status. Returns transparent for eliminated teams so the cell
 * collapses visually but keeps the table grid aligned.
 */
export function getQualificationBarClass(status: QualificationStatus): string {
  switch (status) {
    case "advances_to_r32":
      return "bg-foreground";
    case "best_third_playoff":
      return "bg-muted-foreground/40";
    case "eliminated":
    default:
      return "bg-transparent";
  }
}
