// Two identity colours per team. Curated from each flag's primary colours where
// known (so a user can read the donut at a glance); otherwise a deterministic,
// distinct pair from the palette. Pure white is avoided — it vanishes on light cards.
const FLAG_COLORS: Record<string, [string, string]> = {
  ESP: ["#c60b1e", "#ffc400"],
  CPV: ["#003893", "#cf2027"],
  BRA: ["#009c3b", "#ffdf00"],
  MAR: ["#c1272d", "#006233"],
  GER: ["#dd0000", "#ffce00"],
  CUW: ["#002b7f", "#f9d90f"],
  NED: ["#ae1c28", "#21468b"],
  JPN: ["#bc002d", "#2b2b2b"],
  BEL: ["#ed2939", "#fae042"],
  EGY: ["#ce1126", "#2b2b2b"],
  KSA: ["#006c35", "#5fa777"],
  URU: ["#0038a8", "#fcd116"],
  ARG: ["#6cace4", "#f6b40e"],
  ALG: ["#006233", "#d21034"],
  FRA: ["#0055a4", "#ef4135"],
  SEN: ["#00853f", "#e31b23"],
  POR: ["#006600", "#d52b1e"],
  COD: ["#007fff", "#f7d618"],
  ENG: ["#ce1124", "#1d3a8a"],
  CRO: ["#ff0000", "#171796"],
  ITA: ["#008c45", "#cd212a"],
  MEX: ["#006847", "#ce1126"],
  USA: ["#3c3b6e", "#b22234"],
  COL: ["#fcd116", "#ce1126"],
  ECU: ["#ffd100", "#0072ce"],
  PAR: ["#d52b1e", "#0038a8"],
  SUI: ["#d52b1e", "#9ca3af"],
  SWE: ["#006aa7", "#fecc00"],
  NOR: ["#ba0c2f", "#00205b"],
  AUT: ["#ed2939", "#9ca3af"],
  SCO: ["#0065bf", "#5d8fc4"],
  TUR: ["#e30a17", "#7a1118"],
  KOR: ["#0047a0", "#cd2e3a"],
  CZE: ["#11457e", "#d7141a"],
  CAN: ["#ff0000", "#a30000"],
  GHA: ["#006b3f", "#fcd116"],
  TUN: ["#e70013", "#9b0010"],
  IRN: ["#239f40", "#da0000"],
  NZL: ["#00247d", "#cc142b"],
  AUS: ["#00843d", "#ffcd00"],
  CIV: ["#f77f00", "#009e60"],
  PAN: ["#005293", "#d21034"],
  QAT: ["#8a1538", "#5e0e26"],
  RSA: ["#007a4d", "#de3831"],
  BIH: ["#002395", "#fecb00"],
  HAI: ["#00209f", "#d21034"],
  JOR: ["#007a3d", "#ce1126"],
  IRQ: ["#007a3b", "#ce1126"],
  UZB: ["#1eb53a", "#0099b5"],
};

const PALETTE = ["#3b82f6", "#8b5cf6", "#06b6d4", "#ec4899", "#f59e0b", "#6366f1", "#14b8a6", "#f97316"] as const;

// The candidate identity colours for a team — curated flag colours, or a distinct
// deterministic pair from the palette for teams not in the map.
export function teamColors(fifaCode: string): [string, string] {
  const curated = FLAG_COLORS[fifaCode];
  if (curated) return curated;

  let hash = 0;
  for (let i = 0; i < fifaCode.length; i++) hash += fifaCode.charCodeAt(i);
  const a = PALETTE[hash % PALETTE.length];
  const b = PALETTE[(hash + 3) % PALETTE.length];
  return [a, a === b ? PALETTE[(hash + 4) % PALETTE.length] : b];
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function colorDistance(a: string, b: string): number {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

// One solid, identifiable colour per side, guaranteed visually distinct: the away
// team falls back through its second flag colour and the palette until it's far
// enough from the home colour. Keeps a single match's donut readable.
const MIN_DISTANCE = 130;

export function matchTeamColors(homeCode: string, awayCode: string): { home: string; away: string } {
  const home = teamColors(homeCode)[0];
  const candidates = [...teamColors(awayCode), ...PALETTE];
  const away = candidates.find((color) => colorDistance(color, home) >= MIN_DISTANCE) ?? candidates[0];
  return { home, away };
}

// Black or white text, whichever reads better on the given solid colour.
export function readableTextColor(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 150 ? "#1a1a1a" : "#ffffff";
}
