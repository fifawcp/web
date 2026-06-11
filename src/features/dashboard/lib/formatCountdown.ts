import type { CountdownValues } from "./computeCountdown";

const pad = (n: number) => String(n).padStart(2, "0");

// Compact ticking-countdown string with zero-padded units so the width stays
// constant as digits flip (e.g. "08h 09m 40s", not "8h 9m 40s"). Pair with
// `tabular-nums` at the call site for a fully stable width.
export function formatCountdownShort(countdown: CountdownValues): string {
  if (countdown.isExpired) return "";
  if (countdown.days > 0) return `${pad(countdown.days)}d ${pad(countdown.hours)}h ${pad(countdown.minutes)}m`;
  if (countdown.hours > 0) return `${pad(countdown.hours)}h ${pad(countdown.minutes)}m ${pad(countdown.seconds)}s`;
  return `${pad(countdown.minutes)}m ${pad(countdown.seconds)}s`;
}
