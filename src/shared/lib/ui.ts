/**
 * Two-letter avatar initials. Prefers first+last name, falls back to the username.
 * @example getInitials("dmongs", "Diego", "Mongs") // "DM"
 */
export const getInitials = (username: string, firstName?: string, lastName?: string) => {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  return username.slice(0, 2).toUpperCase();
};
