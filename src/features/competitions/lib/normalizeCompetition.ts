import type { Competition, CompetitionType } from "../types/competitions.types";

// Backward-compat shim for the `pool` -> `pick` rename: a stale/pre-migration API response can still
// carry `type: "pool"`. Applied at every fetch boundary. Safe to delete once no `pool` rows remain.
const LEGACY_TYPE: Record<string, CompetitionType> = { pool: "pick" };

export function normalizeCompetitionType(type: string): CompetitionType {
  return LEGACY_TYPE[type] ?? (type as CompetitionType);
}

export function normalizeCompetition(competition: Competition): Competition {
  const type = normalizeCompetitionType(competition.type);
  return type === competition.type ? competition : { ...competition, type };
}
