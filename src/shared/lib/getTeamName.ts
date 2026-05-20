import type { Team } from "@/shared/types/wcp.types";

export function getTeamName(team: Team, locale: string): string {
  return team.name[locale] ?? team.name.en ?? team.fifa_code;
}
