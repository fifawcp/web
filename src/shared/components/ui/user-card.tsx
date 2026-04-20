"use client";

import Link from "next/link";

interface UserCardProps {
  username: string;
  points?: number;
  firstName?: string;
  lastName?: string;
}

export function UserCard({ username, points = 0, firstName, lastName }: UserCardProps) {
  const initials = firstName && lastName ? `${firstName[0]}${lastName[0]}`.toUpperCase() : username.substring(0, 2).toUpperCase();

  return (
    <Link
      href="/home"
      className="flex items-center justify-between md:justify-center gap-2 p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
    >
      <div className="h-8 w-8 rounded-full bg-linear-to-br from-wc-red to-wc-orange flex items-center justify-center text-white text-xs font-bold">{initials}</div>
      <div className="flex flex-col items-end">
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">@{username}</span>
        <span className="text-xs text-zinc-600 dark:text-zinc-400">{points} pts</span>
      </div>
    </Link>
  );
}
