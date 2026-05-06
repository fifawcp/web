import { signOut } from "next-auth/react";

import { removeLastVisitedBoardId } from "@/features/boards/utils/boardStorage";

import { logout as apiLogout } from "../api/client";

// Terminates the session on both sides: invalidates the server-side session (and the
// associated refresh token) via the API, then clears the NextAuth cookie.
// The API call is best-effort - if the refresh token is already expired the API will
// return 401, which we swallow so the client-side signOut still runs unconditionally.
export async function logoutAndSignOut(redirectUrl = "/"): Promise<void> {
  try {
    await apiLogout();
  } catch {
    // Swallow errors -> signOut runs regardless below
  }

  // Clear last visited board ID to prevent stale data when logging in with a different user
  removeLastVisitedBoardId();
  // Clear cookie as well
  document.cookie = "LastVisitedBoardId=; path=/; max-age=0";

  await signOut({ redirect: false });
  window.location.href = redirectUrl;
}
