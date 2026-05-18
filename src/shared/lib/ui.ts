const rankColors = {
  1: "gold",
  2: "silver",
  3: "bronze",
} as const;

type ColorType = "text" | "bg" | "border";

export const getRankColor = (rank: number, type: ColorType = "text") => {
  const color = rankColors[rank as keyof typeof rankColors];
  return color ? `${type}-${color}` : "";
};

/**
 * Two-letter avatar initials. Prefers first+last name, falls back to the username.
 * @example getInitials("dmongs", "Diego", "Mongs") // "DM"
 */
export const getInitials = (username: string, firstName?: string, lastName?: string) => {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  return username.slice(0, 2).toUpperCase();
};
