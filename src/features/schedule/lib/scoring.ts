type ScoreLike = { home_score: number; away_score: number };

export type Outcome = "home" | "away" | "draw";

export function getOutcome({ home_score, away_score }: ScoreLike): Outcome {
  if (home_score > away_score) return "home";
  if (home_score < away_score) return "away";
  return "draw";
}

export function isCorrectScore(pick: ScoreLike, result: ScoreLike): boolean {
  return pick.home_score === result.home_score && pick.away_score === result.away_score;
}

export function isCorrectOutcome(pick: ScoreLike, result: ScoreLike): boolean {
  return getOutcome(pick) === getOutcome(result);
}
