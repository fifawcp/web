import type { GroupCode } from "@/features/schedule/types/schedule.types";

import type { GroupPick, PickemState } from "../types/standings.types";

/**
 * Mock data used as fallback when the backend is unreachable. Once the upstream
 * `/standings` and `/pickems` endpoints are live, real responses take precedence
 * — these are only consumed by the `?? MOCK_*` fallbacks in the page loader.
 */

type TeamSeed = readonly [fifaCode: string, iso2: string, enName: string, esName: string];

const GROUPS: Record<GroupCode, readonly TeamSeed[]> = {
  A: [
    ["MEX", "mx", "Mexico", "México"],
    ["CRO", "hr", "Croatia", "Croacia"],
    ["CMR", "cm", "Cameroon", "Camerún"],
    ["KSA", "sa", "Saudi Arabia", "Arabia Saudita"],
  ],
  B: [
    ["BEL", "be", "Belgium", "Bélgica"],
    ["CAN", "ca", "Canada", "Canadá"],
    ["KOR", "kr", "South Korea", "Corea del Sur"],
    ["SEN", "sn", "Senegal", "Senegal"],
  ],
  C: [
    ["GER", "de", "Germany", "Alemania"],
    ["USA", "us", "United States", "Estados Unidos"],
    ["JPN", "jp", "Japan", "Japón"],
    ["NOR", "no", "Norway", "Noruega"],
  ],
  D: [
    ["BRA", "br", "Brazil", "Brasil"],
    ["SUI", "ch", "Switzerland", "Suiza"],
    ["AUS", "au", "Australia", "Australia"],
    ["EGY", "eg", "Egypt", "Egipto"],
  ],
  E: [
    ["ARG", "ar", "Argentina", "Argentina"],
    ["DEN", "dk", "Denmark", "Dinamarca"],
    ["POL", "pl", "Poland", "Polonia"],
    ["GHA", "gh", "Ghana", "Ghana"],
  ],
  F: [
    ["FRA", "fr", "France", "Francia"],
    ["POR", "pt", "Portugal", "Portugal"],
    ["TUN", "tn", "Tunisia", "Túnez"],
    ["PER", "pe", "Peru", "Perú"],
  ],
  G: [
    ["ESP", "es", "Spain", "España"],
    ["URU", "uy", "Uruguay", "Uruguay"],
    ["AUT", "at", "Austria", "Austria"],
    ["JAM", "jm", "Jamaica", "Jamaica"],
  ],
  H: [
    ["ENG", "gb-eng", "England", "Inglaterra"],
    ["COL", "co", "Colombia", "Colombia"],
    ["PAR", "py", "Paraguay", "Paraguay"],
    ["ALG", "dz", "Algeria", "Argelia"],
  ],
  I: [
    ["NED", "nl", "Netherlands", "Países Bajos"],
    ["MAR", "ma", "Morocco", "Marruecos"],
    ["ECU", "ec", "Ecuador", "Ecuador"],
    ["BFA", "bf", "Burkina Faso", "Burkina Faso"],
  ],
  J: [
    ["ITA", "it", "Italy", "Italia"],
    ["CHI", "cl", "Chile", "Chile"],
    ["WAL", "gb-wls", "Wales", "Gales"],
    ["ZAM", "zm", "Zambia", "Zambia"],
  ],
  K: [
    ["CZE", "cz", "Czechia", "Chequia"],
    ["ROU", "ro", "Romania", "Rumanía"],
    ["VEN", "ve", "Venezuela", "Venezuela"],
    ["IRN", "ir", "Iran", "Irán"],
  ],
  L: [
    ["NZL", "nz", "New Zealand", "Nueva Zelanda"],
    ["HON", "hn", "Honduras", "Honduras"],
    ["SVK", "sk", "Slovakia", "Eslovaquia"],
    ["HUN", "hu", "Hungary", "Hungría"],
  ],
};

// Predicted positions per group — what the mock user picked for each team at real position 1..4.
// Hand-tuned to demonstrate every comparison state (exact / off-by-1 / off-by-2+ / perfect group).
const PREDICTIONS: Record<GroupCode, readonly [number, number, number, number]> = {
  A: [1, 2, 3, 4], // perfect ★
  B: [2, 1, 3, 4], // top-2 swapped
  C: [3, 1, 2, 4], // leader demoted
  D: [4, 3, 2, 1], // fully reversed
  E: [1, 2, 4, 3], // bottom-2 swapped
  F: [1, 3, 2, 4], // middle swap
  G: [2, 1, 4, 3], // both pairs swapped
  H: [1, 2, 3, 4], // perfect ★
  I: [3, 4, 1, 2], // halves swapped
  J: [1, 2, 3, 4], // perfect ★
  K: [1, 3, 2, 4], // middle swap
  L: [2, 1, 3, 4], // top-2 swapped
};

function flagUrl(iso2: string): string {
  return `https://flagcdn.com/w40/${iso2}.png`;
}

function groupEntries(): Array<[GroupCode, readonly TeamSeed[]]> {
  return Object.entries(GROUPS) as Array<[GroupCode, readonly TeamSeed[]]>;
}

const groupPicks: GroupPick[] = groupEntries().map(([group_code, teams]) => {
  const preds = PREDICTIONS[group_code];
  return {
    group_code,
    teams: teams.map((seed, idx) => {
      const [fifa_code, iso2, en, es] = seed;
      return {
        fifa_code,
        flag_url: flagUrl(iso2),
        group_code,
        name: { en, es },
        position: preds[idx],
      };
    }),
  };
});

export const MOCK_PICKEMS: PickemState = {
  stage_code: "group_stage",
  is_locked: true,
  group_picks: groupPicks,
};
