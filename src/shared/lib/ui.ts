/**
 * Two-letter avatar initials. Prefers first+last name, falls back to the username.
 * @example getInitials("dmongs", "Diego", "Mongs") // "DM"
 */
export const getInitials = (username: string, firstName?: string, lastName?: string) => {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  return username.slice(0, 2).toUpperCase();
};

// Full name from first/last, falling back to the username.
export const displayName = (username: string, firstName?: string | null, lastName?: string | null): string => [firstName, lastName].filter(Boolean).join(" ") || username;

const AVATAR_TONES = [
  "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
  "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200",
  "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200",
] as const;

export const avatarTone = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash + seed.charCodeAt(i)) % AVATAR_TONES.length;
  return AVATAR_TONES[hash];
};
