"use client";

import { useState } from "react";
import { flexRender, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table";

import { BoardDetails, BoardMemberDetails } from "@/features/boards/types/board.types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";

import { useBoardRankingColumns } from "../hooks/useBoardRankingColumns";

interface BoardRankingTableDesktopProps {
  board: BoardDetails;
  members: BoardMemberDetails[];
  currentUserId: string;
  onUpdateRole: (userId: string, newRole: "admin" | "member") => Promise<void>;
  onRemoveMember?: (userId: string) => void;
}

export function BoardRankingTableDesktop({ board, members, currentUserId, onUpdateRole, onRemoveMember }: BoardRankingTableDesktopProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useBoardRankingColumns({
    board,
    currentUserId,
    onUpdateRole,
    onRemoveMember,
  });

  //eslint-disable-next-line
  const table = useReactTable({
    data: members,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    columnResizeMode: "onChange",
    state: {
      sorting,
    },
  });

  return (
    <div className="hidden md:block rounded-lg border bg-card overflow-x-auto">
      <Table className="w-full">
        <TableHeader className="bg-muted">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={`text-xs uppercase text-muted-foreground ${header.column.id === "username" ? "w-auto" : ""}`}
                  style={{
                    width: header.column.id === "username" ? undefined : `${header.getSize()}px`,
                    minWidth:
                      header.column.id === "username" ? `${header.getSize()}px` : header.column.id === "actions" || header.column.id === "rank" ? "40px" : "110px",
                  }}
                >
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cell.column.id === "username" ? "w-auto" : ""}
                    style={{
                      width: cell.column.id === "username" ? undefined : `${cell.column.getSize()}px`,
                      minWidth:
                        cell.column.id === "username" ? `${cell.column.getSize()}px` : cell.column.id === "actions" || cell.column.id === "rank" ? "40px" : "110px",
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
