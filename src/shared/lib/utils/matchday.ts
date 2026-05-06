export type MatchStage = "groupStage1" | "groupStage2" | "groupStage3" | "roundOf32" | "roundOf16" | "quarterFinals" | "semiFinals" | "thirdPlace" | "final";

function getTodayUTCDate() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function inRangeUTC(date: Date, start: string, end: string) {
  const s = new Date(start + "T00:00:00Z");
  const e = new Date(end + "T23:59:59Z");
  return date >= s && date <= e;
}

export function getCurrentWorldCup2026Stage(): MatchStage {
  const today = getTodayUTCDate();

  if (inRangeUTC(today, "2026-06-11", "2026-06-16")) return "groupStage1";
  if (inRangeUTC(today, "2026-06-17", "2026-06-21")) return "groupStage2";
  if (inRangeUTC(today, "2026-06-22", "2026-06-27")) return "groupStage3";

  if (inRangeUTC(today, "2026-06-28", "2026-07-03")) return "roundOf32";
  if (inRangeUTC(today, "2026-07-04", "2026-07-07")) return "roundOf16";
  if (inRangeUTC(today, "2026-07-09", "2026-07-11")) return "quarterFinals";
  if (inRangeUTC(today, "2026-07-14", "2026-07-15")) return "semiFinals";
  if (inRangeUTC(today, "2026-07-18", "2026-07-18")) return "thirdPlace";
  if (inRangeUTC(today, "2026-07-19", "2026-07-19")) return "final";

  if (today < new Date("2026-06-11T00:00:00Z")) {
    return "groupStage1";
  }

  return "final";
}
