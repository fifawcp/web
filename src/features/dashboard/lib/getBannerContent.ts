import type { StageCode } from "@/shared/types/wcp.types";

export type BannerContent = {
  key: "group" | "knockout" | "guest";
  href: "/schedule" | "/bracket" | "/register";
};

// Phase-aware nudge under the featured match: schedule during groups, bracket once knockouts start.
export function getBannerContent(stageCode: StageCode | null, isLoggedIn: boolean): BannerContent {
  if (!isLoggedIn) return { key: "guest", href: "/register" };
  if (stageCode && stageCode !== "group_stage") return { key: "knockout", href: "/bracket" };
  return { key: "group", href: "/schedule" };
}
