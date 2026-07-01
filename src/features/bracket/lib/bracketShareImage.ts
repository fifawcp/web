import {
  BRACKET_FEEDERS,
  FINAL_MATCH_ID,
  QF_LEFT_ORDER,
  QF_RIGHT_ORDER,
  R16_LEFT_ORDER,
  R16_RIGHT_ORDER,
  R32_LEFT_ORDER,
  R32_RIGHT_ORDER,
  SF_LEFT_ORDER,
  SF_RIGHT_ORDER,
  THIRD_PLACE_MATCH_ID,
} from "@/features/pickems/lib/bracketStructure";
import type { BracketMatchSlot } from "@/features/pickems/types/pickems.types";
import { getTeamName } from "@/shared/lib/getTeamName";
import type { Team } from "@/shared/types/wcp.types";

// =============================================================================
// Dependency-free bracket → PNG renderer.
//
// The simulator's Share button needs a clean, self-contained image of the
// current simulated tree. Rather than pull in an html-to-canvas library, we
// build a purpose-drawn SVG (a folded 9-column bracket) and rasterize it via a
// canvas. Flags are inlined as data URLs first, so the canvas never becomes
// tainted and `toBlob` works for download / Web Share.
// =============================================================================

export type BracketShareTheme = "light" | "dark";

type Palette = {
  bg: string;
  card: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  accentSoft: string;
  champ: string;
  champSoft: string;
  champBorder: string;
};

const PALETTES: Record<BracketShareTheme, Palette> = {
  light: {
    bg: "#ffffff",
    card: "#ffffff",
    border: "#e4e4e7",
    text: "#18181b",
    muted: "#71717a",
    accent: "#4f46e5",
    accentSoft: "#eef2ff",
    champ: "#b45309",
    champSoft: "#fffbeb",
    champBorder: "#f59e0b",
  },
  dark: {
    bg: "#0a0a0a",
    card: "#161618",
    border: "#27272a",
    text: "#fafafa",
    muted: "#a1a1aa",
    accent: "#a5b4fc",
    accentSoft: "#1e1b4b",
    champ: "#fbbf24",
    champSoft: "#241a05",
    champBorder: "#a16207",
  },
};

// --- Geometry -------------------------------------------------------------
const CARD_W = 122;
const ROW_H = 18;
const CARD_H = ROW_H * 2;
const COL_GAP = 30;
const PITCH = CARD_W + COL_GAP;
const R32_V_GAP = 16;
const R32_PITCH = CARD_H + R32_V_GAP;
const PAD_X = 44;
const HEADER_H = 104;
const FOOTER_H = 76;
const FLAG_W = 18;
const FLAG_H = 12;

const COLUMN_COUNT = 9;
const TREE_W = COLUMN_COUNT * CARD_W + (COLUMN_COUNT - 1) * COL_GAP;
const CONTENT_H = R32_LEFT_ORDER.length * R32_PITCH;
const WIDTH = TREE_W + PAD_X * 2;
const HEIGHT = HEADER_H + CONTENT_H + FOOTER_H;

// Column index (0..8) per match id, left arm → center → right arm.
const COLUMN_INDEX: Record<number, number> = {};
const assignColumn = (ids: readonly number[], idx: number) => ids.forEach((id) => (COLUMN_INDEX[id] = idx));
assignColumn(R32_LEFT_ORDER, 0);
assignColumn(R16_LEFT_ORDER, 1);
assignColumn(QF_LEFT_ORDER, 2);
assignColumn(SF_LEFT_ORDER, 3);
assignColumn([FINAL_MATCH_ID], 4);
assignColumn(SF_RIGHT_ORDER, 5);
assignColumn(QF_RIGHT_ORDER, 6);
assignColumn(R16_RIGHT_ORDER, 7);
assignColumn(R32_RIGHT_ORDER, 8);

type Box = { x: number; y: number; cx: number; cy: number };

/**
 * Vertical centers for every match: R32 cards distribute evenly down each arm,
 * every later match centers between its two feeders (recursively). The Final
 * lands dead-center between the two semifinals.
 */
function computeCenters(): Map<number, number> {
  const centers = new Map<number, number>();
  const place = (ids: readonly number[]) => ids.forEach((id, i) => centers.set(id, HEADER_H + (i + 0.5) * R32_PITCH));
  place(R32_LEFT_ORDER);
  place(R32_RIGHT_ORDER);

  const resolve = (id: number): number => {
    const cached = centers.get(id);
    if (cached !== undefined) return cached;
    const feeders = BRACKET_FEEDERS[id];
    const cy = feeders ? (resolve(feeders.home) + resolve(feeders.away)) / 2 : HEADER_H + CONTENT_H / 2;
    centers.set(id, cy);
    return cy;
  };
  [...R16_LEFT_ORDER, ...QF_LEFT_ORDER, ...SF_LEFT_ORDER, ...R16_RIGHT_ORDER, ...QF_RIGHT_ORDER, ...SF_RIGHT_ORDER, FINAL_MATCH_ID].forEach(resolve);
  return centers;
}

function boxFor(matchId: number, centers: Map<number, number>): Box {
  const col = COLUMN_INDEX[matchId];
  const x = PAD_X + col * PITCH;
  const cy = centers.get(matchId) ?? HEADER_H + CONTENT_H / 2;
  return { x, y: cy - CARD_H / 2, cx: x + CARD_W / 2, cy };
}

const escapeXml = (s: string): string => s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c] ?? c);

function truncate(name: string, max = 13): string {
  return name.length > max ? `${name.slice(0, max - 1)}…` : name;
}

// --- Flag inlining --------------------------------------------------------
async function fetchAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function buildFlagMap(slots: BracketMatchSlot[]): Promise<Map<string, string>> {
  const byCode = new Map<string, string>();
  for (const slot of slots) {
    for (const team of [slot.home_team, slot.away_team, slot.picked_team]) {
      if (team) byCode.set(team.fifa_code, team.flag_url);
    }
  }
  const entries = await Promise.all([...byCode].map(async ([code, url]) => [code, await fetchAsDataUrl(url)] as const));
  const out = new Map<string, string>();
  for (const [code, dataUrl] of entries) if (dataUrl) out.set(code, dataUrl);
  return out;
}

// --- SVG fragments --------------------------------------------------------
function teamRow(team: Team | null, picked: boolean, x: number, y: number, locale: string, flags: Map<string, string>, p: Palette): string {
  const cy = y + ROW_H / 2;
  const flagX = x + 9;
  const textX = flagX + FLAG_W + 7;
  if (!team) {
    return `<text x="${textX}" y="${cy + 3.5}" font-size="10" fill="${p.muted}" font-style="italic">—</text>`;
  }
  const dataUrl = flags.get(team.fifa_code);
  const fy = cy - FLAG_H / 2;
  const flag = dataUrl
    ? `<image href="${dataUrl}" x="${flagX}" y="${fy}" width="${FLAG_W}" height="${FLAG_H}" preserveAspectRatio="xMidYMid slice"/><rect x="${flagX}" y="${fy}" width="${FLAG_W}" height="${FLAG_H}" rx="2" fill="none" stroke="${p.border}" stroke-width="0.75"/>`
    : `<rect x="${flagX}" y="${fy}" width="${FLAG_W}" height="${FLAG_H}" rx="2" fill="${p.border}"/>`;
  const name = escapeXml(truncate(getTeamName(team, locale)));
  return `${flag}<text x="${textX}" y="${cy + 3.5}" font-size="10.5" font-weight="${picked ? 700 : 500}" fill="${picked ? p.accent : p.text}">${name}</text>`;
}

function matchCard(slot: BracketMatchSlot, box: Box, locale: string, flags: Map<string, string>, p: Palette): string {
  const pickedCode = slot.picked_team?.fifa_code;
  const homePicked = !!pickedCode && pickedCode === slot.home_team?.fifa_code;
  const awayPicked = !!pickedCode && pickedCode === slot.away_team?.fifa_code;
  const { x, y } = box;
  const homeFill = homePicked ? `<rect x="${x}" y="${y}" width="${CARD_W}" height="${ROW_H}" fill="${p.accentSoft}"/>` : "";
  const awayFill = awayPicked ? `<rect x="${x}" y="${y + ROW_H}" width="${CARD_W}" height="${ROW_H}" fill="${p.accentSoft}"/>` : "";
  return `
    <g>
      <rect x="${x}" y="${y}" width="${CARD_W}" height="${CARD_H}" rx="6" fill="${p.card}" stroke="${p.border}" stroke-width="1"/>
      ${homeFill}${awayFill}
      <rect x="${x}" y="${y}" width="${CARD_W}" height="${CARD_H}" rx="6" fill="none" stroke="${p.border}" stroke-width="1"/>
      <line x1="${x}" y1="${y + ROW_H}" x2="${x + CARD_W}" y2="${y + ROW_H}" stroke="${p.border}" stroke-width="1"/>
      ${teamRow(slot.home_team, homePicked, x, y, locale, flags, p)}
      ${teamRow(slot.away_team, awayPicked, x, y + ROW_H, locale, flags, p)}
    </g>`;
}

function connector(feeder: Box, target: Box, p: Palette): string {
  const flowingRight = target.cx > feeder.cx;
  const startX = flowingRight ? feeder.x + CARD_W : feeder.x;
  const endX = flowingRight ? target.x : target.x + CARD_W;
  const midX = (startX + endX) / 2;
  return `<path d="M ${startX} ${feeder.cy} H ${midX} V ${target.cy} H ${endX}" fill="none" stroke="${p.border}" stroke-width="1.25"/>`;
}

/**
 * Center column: the crowned champion as a prominent gold-bordered block ABOVE
 * the Final, and the Third-Place playoff card BELOW it. The Final card itself is
 * drawn in the main pass (it's a normal column). The champion is the visual
 * apex, so it gets its own highlighted treatment rather than a cramped caption.
 */
function finalExtras(
  thirdSlot: BracketMatchSlot | null,
  champion: Team | null,
  centers: Map<number, number>,
  locale: string,
  flags: Map<string, string>,
  p: Palette,
  championLabel: string,
  thirdLabel: string
): string {
  const finalBox = boxFor(FINAL_MATCH_ID, centers);
  const cx = finalBox.cx;
  const parts: string[] = [];

  // Champion — highlighted block sitting above the Final (the tree's apex).
  if (champion) {
    const w = CARD_W;
    const h = 78;
    const x = cx - w / 2;
    const top = finalBox.y - 16 - h;
    const dataUrl = flags.get(champion.fifa_code);
    const cFlagW = 30;
    const cFlagH = 20;
    const flag = dataUrl
      ? `<image href="${dataUrl}" x="${cx - cFlagW / 2}" y="${top + 30}" width="${cFlagW}" height="${cFlagH}" preserveAspectRatio="xMidYMid slice"/><rect x="${cx - cFlagW / 2}" y="${top + 30}" width="${cFlagW}" height="${cFlagH}" rx="2" fill="none" stroke="${p.champBorder}" stroke-width="0.75"/>`
      : "";
    const name = escapeXml(truncate(getTeamName(champion, locale), 16));
    parts.push(`
      <g>
        <rect x="${x}" y="${top}" width="${w}" height="${h}" rx="10" fill="${p.champSoft}" stroke="${p.champBorder}" stroke-width="2"/>
        <g text-anchor="middle">
          <text x="${cx}" y="${top + 20}" font-size="9.5" font-weight="700" letter-spacing="2.5" fill="${p.champ}">🏆 ${escapeXml(championLabel.toUpperCase())}</text>
          ${flag}
          <text x="${cx}" y="${top + 68}" font-size="16" font-weight="800" fill="${p.text}">${name}</text>
        </g>
      </g>`);
  }

  // Third place — below the Final.
  if (thirdSlot) {
    const labelY = finalBox.y + CARD_H + 24;
    const cardY = finalBox.y + CARD_H + 30;
    const box: Box = { x: finalBox.x, y: cardY, cx, cy: cardY + CARD_H / 2 };
    parts.push(
      `<text x="${cx}" y="${labelY}" text-anchor="middle" font-size="8.5" font-weight="700" letter-spacing="2" fill="${p.muted}">${escapeXml(thirdLabel.toUpperCase())}</text>`
    );
    parts.push(matchCard(thirdSlot, box, locale, flags, p));
  }

  return parts.join("");
}

// The 2026 ball-target brand mark, drawn from the favicon geometry (24×24).
// `icon` is the stroke / ball-fill colour; the soccer-ball pentagons stay white.
function ballTargetMark(icon: string): string {
  return `
    <g fill="none" stroke="${icon}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="8"/>
      <line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/>
      <line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/>
      <line x1="4" y1="12" x2="5.5" y2="12"/><line x1="18.5" y1="12" x2="20" y2="12"/>
      <line x1="12" y1="4" x2="12" y2="5.5"/><line x1="12" y1="18.5" x2="12" y2="20"/>
    </g>
    <g transform="translate(7 7) scale(0.0515)">
      <circle fill="${icon}" cx="97" cy="97" r="97"/>
      <path fill="#ffffff" d="m 94,9.2 a 88,88 0 0 0 -55,21.8 l 27,0 28,-14.4 0,-7.4 z m 6,0 0,7.4 28,14.4 27,0 a 88,88 0 0 0 -55,-21.8 z m -67.2,27.8 a 88,88 0 0 0 -20,34.2 l 16,27.6 23,-3.6 21,-36.2 -8.4,-22 -31.6,0 z m 96.8,0 -8.4,22 21,36.2 23,3.6 15.8,-27.4 a 88,88 0 0 0 -19.8,-34.4 l -31.6,0 z m -50,26 -20.2,35.2 17.8,30.8 39.6,0 17.8,-30.8 -20.2,-35.2 -34.8,0 z m -68.8,16.6 a 88,88 0 0 0 -1.8,17.4 88,88 0 0 0 10.4,41.4 l 7.4,-4.4 -1.4,-29 -14.6,-25.4 z m 172.4,0.2 -14.6,25.2 -1.4,29 7.4,4.4 a 88,88 0 0 0 10.4,-41.4 88,88 0 0 0 -1.8,-17.2 z m -106,57.2 -15.4,19 L 77.2,182.6 a 88,88 0 0 0 19.8,2.4 88,88 0 0 0 19.8,-2.4 l 15.4,-26.6 -15.4,-19 -39.6,0 z m -47.8,2.6 -7,4 A 88,88 0 0 0 68.8,180.4 l -14,-24.6 -25.4,-16.2 z m 135.2,0 -25.4,16.2 -14,24.4 a 88,88 0 0 0 46.4,-36.6 l -7,-4 z"/>
    </g>`;
}

/**
 * Bottom-right brand lockup — the same chip + ball-target mark + two-line
 * "2026 / Pick'ems" wordmark as the in-app `Brand` component. The mark stays
 * dark-on-light in both themes (chip is white on dark, a muted tint on light).
 */
function brandLockup(p: Palette, brand: string, year: string, theme: BracketShareTheme): string {
  const chip = 30;
  const lockupW = 116;
  const ox = WIDTH - PAD_X - lockupW;
  const chipTop = HEIGHT - 22 - chip;
  const chipFill = theme === "dark" ? "#ffffff" : "#f4f4f5";
  const textX = ox + chip + 9;
  return `
    <g opacity="0.92">
      <rect x="${ox}" y="${chipTop}" width="${chip}" height="${chip}" rx="7" fill="${chipFill}" stroke="${p.border}" stroke-width="1"/>
      <g transform="translate(${ox + 3} ${chipTop + 3})">${ballTargetMark("#18181b")}</g>
      <text x="${textX}" y="${chipTop + 12}" font-size="8" font-weight="600" letter-spacing="2.5" fill="${p.muted}">${escapeXml(year)}</text>
      <text x="${textX}" y="${chipTop + 26}" font-size="15" font-weight="800" fill="${p.text}">${escapeXml(brand)}</text>
    </g>`;
}

export type BracketShareOptions = {
  locale: string;
  champion: Team | null;
  theme: BracketShareTheme;
  /** Big title, e.g. "My World Cup 2026 bracket". */
  title: string;
  /** Smaller eyebrow above the title, e.g. "Bracket Simulator". */
  eyebrow: string;
  /** "CHAMPION" label under the trophy. */
  championLabel: string;
  /** "THIRD PLACE" label above the third-place card. */
  thirdPlaceLabel: string;
  /** Wordmark + year for the corner brand lockup. */
  brand: string;
  year: string;
};

/** Build the full SVG markup for the bracket (flags already inlined). */
function buildSvg(slots: BracketMatchSlot[], flags: Map<string, string>, opts: BracketShareOptions): string {
  const p = PALETTES[opts.theme];
  const centers = computeCenters();
  const byId = new Map(slots.map((s) => [s.match_id, s] as const));

  const cards: string[] = [];
  const lines: string[] = [];

  for (const [idStr, target] of Object.entries(BRACKET_FEEDERS)) {
    const id = Number(idStr);
    const targetBox = boxFor(id, centers);
    lines.push(connector(boxFor(target.home, centers), targetBox, p));
    lines.push(connector(boxFor(target.away, centers), targetBox, p));
  }

  for (const id of Object.keys(COLUMN_INDEX).map(Number)) {
    const slot = byId.get(id);
    if (slot) cards.push(matchCard(slot, boxFor(id, centers), opts.locale, flags, p));
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif">
    <rect width="${WIDTH}" height="${HEIGHT}" fill="${p.bg}"/>
    <text x="${PAD_X}" y="46" font-size="11" font-weight="700" letter-spacing="3" fill="${p.accent}">${escapeXml(opts.eyebrow.toUpperCase())}</text>
    <text x="${PAD_X}" y="76" font-size="26" font-weight="800" fill="${p.text}">${escapeXml(opts.title)}</text>
    ${lines.join("")}
    ${cards.join("")}
    ${finalExtras(byId.get(THIRD_PLACE_MATCH_ID) ?? null, opts.champion, centers, opts.locale, flags, p, opts.championLabel, opts.thirdPlaceLabel)}
    ${brandLockup(p, opts.brand, opts.year, opts.theme)}
  </svg>`;
}

async function svgToPngBlob(svg: string, scale = 2): Promise<Blob> {
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  try {
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to rasterize bracket SVG"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = WIDTH * scale;
    canvas.height = HEIGHT * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, WIDTH, HEIGHT);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Canvas export failed"))), "image/png");
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Render the current simulated bracket to a shareable PNG blob. Inlines every
 * flag as a data URL first so the export is never canvas-tainted.
 */
export async function renderBracketShareImage(slots: BracketMatchSlot[], opts: BracketShareOptions): Promise<Blob> {
  const flags = await buildFlagMap(slots);
  const svg = buildSvg(slots, flags, opts);
  return svgToPngBlob(svg);
}
