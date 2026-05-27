/** Mirrors `domain.Session` from the backend swagger. */
export type Session = {
  id: string;
  user_id: string;
  /** Free-form device info object the backend may attach. We don't render it directly. */
  device_info?: unknown;
  user_agent: string;
  ip_address: string;
  created_at: string;
  /** ISO timestamp of the most recent token refresh on this session. */
  last_used_at: string;
  expires_at: string;
};

export type DeviceKind = "desktop" | "mobile" | "tablet" | "unknown";

/** Parsed-down user_agent suitable for the session row. */
export type ParsedDevice = {
  kind: DeviceKind;
  /** e.g. "Chrome on macOS", "Safari on iPhone", or "Unknown device". */
  label: string;
};

/** Role enum from `domain.UserRole`. */
export type UserRole = "user" | "admin";
