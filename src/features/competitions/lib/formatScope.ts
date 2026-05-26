import type { StageCode } from "@/shared/types/wcp.types";

import type { Competition } from "../types/competitions.types";

export const ALL_STAGES: StageCode[] = ["group_stage", "round_of_32", "round_of_16", "quarterfinals", "semifinals", "third_place", "final"];

export type ResolvedScope = {
  stages: StageCode[];
  teamCodes: string[];
  isAllStages: boolean;
  isAllTeams: boolean;
};

export function resolveScope(competition: Competition): ResolvedScope {
  const stages = competition.scope?.stages?.length ? competition.scope.stages : ALL_STAGES;
  const teamCodes = competition.scope?.team_fifa_codes ?? [];
  return {
    stages,
    teamCodes,
    isAllStages: !competition.scope?.stages?.length || competition.scope.stages.length === ALL_STAGES.length,
    isAllTeams: !competition.scope?.team_fifa_codes?.length,
  };
}
