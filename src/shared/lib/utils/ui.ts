const rankColors = {
  1: "gold",
  2: "silver",
  3: "bronze",
} as const;

type ColorType = "text" | "bg" | "border";

export const getRankColor = (rank: number, type: ColorType = "text") => {
  const color = rankColors[rank as keyof typeof rankColors] ?? "wc-gray";
  return `${type}-${color}`;
};
