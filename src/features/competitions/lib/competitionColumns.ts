import type { ColumnDef, RowData } from "@tanstack/react-table";

import type { CompetitionType, LeaderboardEntry, MatchScore, PickemScore } from "../types/competitions.types";

export type LeaderboardColumnId = "rank" | "member" | "total" | "groupExact" | "groupQualifiers" | "bestThirds" | "bracket" | "exactHits" | "outcomes";

export type LeaderboardColumnMeta = {
  align?: "left" | "right" | "center";
  width?: string;
  emphasize?: boolean;
};

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-object-type
  interface ColumnMeta<TData extends RowData, TValue> extends LeaderboardColumnMeta {}
}

type Column = ColumnDef<LeaderboardEntry>;

const pickemScore = (row: LeaderboardEntry) => row.score as PickemScore;
const matchScore = (row: LeaderboardEntry) => row.score as MatchScore;

type ValueColumn = { id: LeaderboardColumnId; value: (row: LeaderboardEntry) => number };

const VALUE_COLUMNS_BY_TYPE: Record<CompetitionType, ValueColumn[]> = {
  pickem: [
    { id: "total", value: (row) => row.score.total },
    { id: "groupExact", value: (row) => pickemScore(row).group_exact_positions },
    { id: "groupQualifiers", value: (row) => pickemScore(row).group_qualifier_hits },
    { id: "bestThirds", value: (row) => pickemScore(row).best_third_hits },
    { id: "bracket", value: (row) => pickemScore(row).bracket_hits },
  ],
  match: [
    { id: "total", value: (row) => row.score.total },
    { id: "exactHits", value: (row) => matchScore(row).exact_hits },
    { id: "outcomes", value: (row) => matchScore(row).correct_outcomes },
  ],
};

const rank: Column = {
  id: "rank",
  accessorFn: (row) => row.rank,
  header: "rank",
  cell: ({ getValue }) => (getValue() as number).toString().padStart(2, "0"),
  meta: { align: "center", width: "w-12" },
};

const member: Column = {
  id: "member",
  accessorFn: (row) => [row.member.first_name, row.member.last_name].filter(Boolean).join(" ") || row.member.username,
  header: "member",
  meta: { align: "left" },
};

const numericCol = ({ id, value }: ValueColumn, emphasize = false): Column => ({
  id,
  accessorFn: value,
  header: id,
  cell: ({ getValue }) => (getValue() as number).toLocaleString(),
  meta: { align: "center", emphasize, width: "w-18" },
});

export function buildColumns(type: CompetitionType): Column[] {
  const valueCols = VALUE_COLUMNS_BY_TYPE[type];
  return [rank, member, ...valueCols.map((col) => numericCol(col, col.id === "total"))];
}

export type MobileCyclableColumn = {
  id: LeaderboardColumnId;
  labelKey: string;
  value: (row: LeaderboardEntry) => number;
};

export function buildMobileCyclableColumns(type: CompetitionType): MobileCyclableColumn[] {
  return VALUE_COLUMNS_BY_TYPE[type].map((col) => ({
    id: col.id,
    labelKey: col.id,
    value: col.value,
  }));
}
