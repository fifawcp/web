import { R32_MATCH_IDS, STAGE_MATCH_IDS, STAGES } from "@/features/pickems/lib/bracketStructure";
import { projectBracket } from "@/features/pickems/lib/projectBracket";
import type { BracketDraft, BracketMatchSlot, BracketStageCode } from "@/features/pickems/types/pickems.types";
import type { GroupCode, Team } from "@/shared/types/wcp.types";

/**
 * DEV-ONLY mock bracket data. Lets us exercise the `/bracket` Compare view
 * before the tournament produces real knockout results. Loaded via dynamic
 * `import()` from a dev-gated toggle, so it is never bundled into the path the
 * user hits in production. Not a fallback for the real API — purely a test aid.
 */

type Seed = { code: string; en: string; es: string; iso2: string };

const flag = (iso2: string): string => `https://flagcdn.com/w320/${iso2}.png`;

const GROUP_SEEDS: Record<GroupCode, [Seed, Seed, Seed, Seed]> = {
  A: [
    { code: "NED", en: "Netherlands", es: "Países Bajos", iso2: "nl" },
    { code: "SEN", en: "Senegal", es: "Senegal", iso2: "sn" },
    { code: "ECU", en: "Ecuador", es: "Ecuador", iso2: "ec" },
    { code: "QAT", en: "Qatar", es: "Catar", iso2: "qa" },
  ],
  B: [
    { code: "ENG", en: "England", es: "Inglaterra", iso2: "gb-eng" },
    { code: "USA", en: "United States", es: "Estados Unidos", iso2: "us" },
    { code: "IRN", en: "Iran", es: "Irán", iso2: "ir" },
    { code: "WAL", en: "Wales", es: "Gales", iso2: "gb-wls" },
  ],
  C: [
    { code: "ARG", en: "Argentina", es: "Argentina", iso2: "ar" },
    { code: "MEX", en: "Mexico", es: "México", iso2: "mx" },
    { code: "POL", en: "Poland", es: "Polonia", iso2: "pl" },
    { code: "KSA", en: "Saudi Arabia", es: "Arabia Saudí", iso2: "sa" },
  ],
  D: [
    { code: "FRA", en: "France", es: "Francia", iso2: "fr" },
    { code: "DEN", en: "Denmark", es: "Dinamarca", iso2: "dk" },
    { code: "AUS", en: "Australia", es: "Australia", iso2: "au" },
    { code: "TUN", en: "Tunisia", es: "Túnez", iso2: "tn" },
  ],
  E: [
    { code: "ESP", en: "Spain", es: "España", iso2: "es" },
    { code: "GER", en: "Germany", es: "Alemania", iso2: "de" },
    { code: "JPN", en: "Japan", es: "Japón", iso2: "jp" },
    { code: "CRC", en: "Costa Rica", es: "Costa Rica", iso2: "cr" },
  ],
  F: [
    { code: "BEL", en: "Belgium", es: "Bélgica", iso2: "be" },
    { code: "CRO", en: "Croatia", es: "Croacia", iso2: "hr" },
    { code: "MAR", en: "Morocco", es: "Marruecos", iso2: "ma" },
    { code: "CAN", en: "Canada", es: "Canadá", iso2: "ca" },
  ],
  G: [
    { code: "BRA", en: "Brazil", es: "Brasil", iso2: "br" },
    { code: "SUI", en: "Switzerland", es: "Suiza", iso2: "ch" },
    { code: "SRB", en: "Serbia", es: "Serbia", iso2: "rs" },
    { code: "CMR", en: "Cameroon", es: "Camerún", iso2: "cm" },
  ],
  H: [
    { code: "POR", en: "Portugal", es: "Portugal", iso2: "pt" },
    { code: "URU", en: "Uruguay", es: "Uruguay", iso2: "uy" },
    { code: "KOR", en: "South Korea", es: "Corea del Sur", iso2: "kr" },
    { code: "GHA", en: "Ghana", es: "Ghana", iso2: "gh" },
  ],
  I: [
    { code: "ITA", en: "Italy", es: "Italia", iso2: "it" },
    { code: "COL", en: "Colombia", es: "Colombia", iso2: "co" },
    { code: "NGA", en: "Nigeria", es: "Nigeria", iso2: "ng" },
    { code: "EGY", en: "Egypt", es: "Egipto", iso2: "eg" },
  ],
  J: [
    { code: "NOR", en: "Norway", es: "Noruega", iso2: "no" },
    { code: "SWE", en: "Sweden", es: "Suecia", iso2: "se" },
    { code: "AUT", en: "Austria", es: "Austria", iso2: "at" },
    { code: "UKR", en: "Ukraine", es: "Ucrania", iso2: "ua" },
  ],
  K: [
    { code: "TUR", en: "Türkiye", es: "Turquía", iso2: "tr" },
    { code: "CHI", en: "Chile", es: "Chile", iso2: "cl" },
    { code: "GRE", en: "Greece", es: "Grecia", iso2: "gr" },
    { code: "PER", en: "Peru", es: "Perú", iso2: "pe" },
  ],
  L: [
    { code: "CZE", en: "Czechia", es: "Chequia", iso2: "cz" },
    { code: "SCO", en: "Scotland", es: "Escocia", iso2: "gb-sct" },
    { code: "ALG", en: "Algeria", es: "Argelia", iso2: "dz" },
    { code: "PAR", en: "Paraguay", es: "Paraguay", iso2: "py" },
  ],
};

const GROUP_CODES = Object.keys(GROUP_SEEDS) as GroupCode[];

const toTeam = (seed: Seed, group: GroupCode): Team => ({
  fifa_code: seed.code,
  name: { en: seed.en, es: seed.es },
  flag_url: flag(seed.iso2),
  group_code: group,
});

const teamAt = (group: GroupCode, position: 0 | 1 | 2 | 3): Team => toTeam(GROUP_SEEDS[group][position], group);

// Lower = stronger: winners (pos 0) over runners-up (1) over thirds (2), group letter breaks ties.
const STRENGTH = new Map<string, number>();
GROUP_CODES.forEach((group, gi) => {
  for (let pos = 0 as 0 | 1 | 2 | 3; pos <= 3; pos++) STRENGTH.set(teamAt(group, pos).fifa_code, pos * 100 + gi);
});
const strengthOf = (t: Team): number => STRENGTH.get(t.fifa_code) ?? Number.MAX_SAFE_INTEGER;

const predictedWinner = (home: Team, away: Team): Team => (strengthOf(home) <= strengthOf(away) ? home : away);
const actualWinner = (home: Team, away: Team, matchId: number): Team => {
  const fav = strengthOf(home) <= strengthOf(away) ? home : away;
  const dog = fav.fifa_code === home.fifa_code ? away : home;
  return (matchId * 7) % 10 < 3 ? dog : fav; // ~30% deterministic upsets
};

function buildBase(): BracketMatchSlot[] {
  const winners = GROUP_CODES.map((g) => teamAt(g, 0));
  const runnersUp = GROUP_CODES.map((g) => teamAt(g, 1));
  const bestThirds = GROUP_CODES.slice(0, 8).map((g) => teamAt(g, 2));
  const qualifiers = [...winners, ...bestThirds, ...runnersUp]; // 32

  const slots: BracketMatchSlot[] = R32_MATCH_IDS.map((id, i) => ({
    match_id: id,
    stage_code: "round_of_32",
    home_team: qualifiers[i],
    away_team: qualifiers[qualifiers.length - 1 - i],
    picked_team: null,
  }));
  const later: BracketStageCode[] = ["round_of_16", "quarterfinals", "semifinals", "third_place", "final"];
  for (const stage of later) {
    for (const id of STAGE_MATCH_IDS[stage]) slots.push({ match_id: id, stage_code: stage, home_team: null, away_team: null, picked_team: null });
  }
  return slots;
}

function buildDraft(base: BracketMatchSlot[], choose: (h: Team, a: Team, id: number) => Team): BracketDraft {
  let draft: BracketDraft = {};
  for (const stage of STAGES) {
    const byId = new Map(projectBracket(base, draft).map((s) => [s.match_id, s] as const));
    for (const id of STAGE_MATCH_IDS[stage]) {
      const slot = byId.get(id);
      if (slot?.home_team && slot?.away_team) draft = { ...draft, [id]: choose(slot.home_team, slot.away_team, id).fifa_code };
    }
  }
  return draft;
}

export type MockBracketData = {
  /** Fully-played fake tournament (favourites + upsets). */
  actual: BracketMatchSlot[];
  /** Favourites-advance prediction, used when the dev isn't signed in / has no picks. */
  predicted: BracketMatchSlot[];
};

export function buildMockBracketData(): MockBracketData {
  const base = buildBase();
  return {
    actual: projectBracket(base, buildDraft(base, actualWinner)),
    predicted: projectBracket(base, buildDraft(base, predictedWinner)),
  };
}
