import type { DeviceKind, ParsedDevice } from "../types/profile.types";

/**
 * Best-effort browser + OS parser. We don't pull in a full UA library — a few
 * regex matches cover the 95th-percentile case ("Chrome on macOS", "Safari on
 * iPhone") and everything else falls back to "Unknown device" rather than a
 * misleading half-match.
 *
 * Returns both a `kind` for icon selection and a human label for the row.
 */
export function parseUserAgent(ua: string): ParsedDevice {
  if (!ua) return { kind: "unknown", label: "Unknown device" };

  const browser = detectBrowser(ua);
  const os = detectOs(ua);
  const kind = detectKind(ua);

  if (browser && os) return { kind, label: `${browser} on ${os}` };
  if (browser) return { kind, label: browser };
  if (os) return { kind, label: os };
  return { kind, label: "Unknown device" };
}

function detectBrowser(ua: string): string | null {
  // Order matters — Edge/Opera/Brave/Vivaldi spoof Chrome, so they need to
  // win the match before the generic Chrome branch fires.
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\/|Opera\//.test(ua)) return "Opera";
  if (/Brave\//.test(ua)) return "Brave";
  if (/Vivaldi\//.test(ua)) return "Vivaldi";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua)) return "Safari";
  return null;
}

function detectOs(ua: string): string | null {
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android/.test(ua)) return "Android";
  if (/Mac OS X|Macintosh/.test(ua)) return "macOS";
  if (/Windows/.test(ua)) return "Windows";
  if (/Linux/.test(ua)) return "Linux";
  if (/CrOS/.test(ua)) return "ChromeOS";
  return null;
}

function detectKind(ua: string): DeviceKind {
  if (/iPad|Tablet/.test(ua)) return "tablet";
  if (/iPhone|Android|Mobile/.test(ua)) return "mobile";
  if (/Windows|Mac OS X|Macintosh|Linux|CrOS/.test(ua)) return "desktop";
  return "unknown";
}
