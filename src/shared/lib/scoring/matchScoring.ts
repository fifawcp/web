// Point values for match-score competitions, mirroring the API scoring config
// (SCORING_MATCH_SCORE_EXACT / SCORING_MATCH_SCORE_OUTCOME — env-configurable on
// the backend, defaults below). The pick-reveal endpoints return raw picks only,
// so the breakdown awards points client-side. Keep in sync if the backend changes.
export const MATCH_SCORE_EXACT = 5;
export const MATCH_SCORE_OUTCOME = 2;
