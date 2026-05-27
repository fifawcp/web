export const LAST_BOARD_COOKIE = "last_board_id";

export function rememberLastBoard(id: number) {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 180;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${LAST_BOARD_COOKIE}=${id}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}
