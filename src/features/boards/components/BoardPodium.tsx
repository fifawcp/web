"use client";

import { Crown } from "lucide-react";

import { BoardMember } from "@/features/boards/types/board.types";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { getRankColor } from "@/shared/lib/utils/ui";

interface BoardPodiumProps {
  members: BoardMember[];
}

interface PodiumPositionProps {
  member: BoardMember;
  maxPoints: number;
  position: number;
}

function PodiumPosition({ member, position, maxPoints }: PodiumPositionProps) {
  const initials = member.username.slice(0, 2).toUpperCase();

  const MIN_HEIGHT = 50;
  const MAX_HEIGHT = 250;

  const height = Math.max(MIN_HEIGHT, (member.total_points / (maxPoints || 1)) * MAX_HEIGHT);

  const isFirst = position === 1;

  const orderClass = isFirst ? "order-2" : position === 2 ? "order-1" : "order-3";
  const containerClass = isFirst ? "bg-black dark:bg-card" : "bg-muted shadow-md";
  const textClass = isFirst ? "text-white" : "text-foreground";
  const textSize = height === MIN_HEIGHT ? "text-3xl md:text-4xl" : "text-4xl md:text-5xl";

  return (
    <div className={`flex flex-col items-center ${orderClass} flex-1`}>
      {isFirst && (
        <div className="mb-2">
          <Crown className="h-6 w-6 text-yellow-500" />
        </div>
      )}
      <div className="relative mb-3">
        <Avatar className={`${isFirst ? "h-16 w-16 md:h-20 md:w-20" : "h-14 w-14 md:h-18 md:w-18"} border-2 ${getRankColor(position, "border")}`}>
          <AvatarFallback className={`md:text-lg text-base font-bold bg-muted ${getRankColor(position, "border")}`}>{initials}</AvatarFallback>
        </Avatar>
      </div>
      <p className="font-semibold text-sm">{member.username}</p>
      <p className={`${isFirst ? "text-xl md:text-2xl" : "text-lg md:text-xl"} font-bold mb-1`}>
        {member.total_points} <span className="text-lg text-muted-foreground">pts</span>
      </p>

      <div className={`w-full ${containerClass} rounded-t-lg flex items-center justify-center border border-border`} style={{ height: `${height}px` }}>
        <span className={`${textSize} font-bold ${textClass}`}>{position}</span>
      </div>
    </div>
  );
}

export function BoardPodium({ members }: BoardPodiumProps) {
  if (members.length === 0) {
    return null;
  }

  const [first, second, third] = members.slice(0, 3);

  const maxPoints = first.total_points;

  return (
    <div
      className="flex justify-center items-end gap-6 mx-auto p-6 pb-0 bg-muted rounded-lg w-full"
      style={{
        backgroundImage: `
    repeating-linear-gradient(
      to top,
      rgba(0,0,0,0.1) 0px,
      rgba(0,0,0,0.1) 1px,
      transparent 1px,
      transparent 50px
    )
  `,
      }}
    >
      {second && <PodiumPosition member={second} position={2} maxPoints={maxPoints} />}
      {first && <PodiumPosition member={first} position={1} maxPoints={maxPoints} />}
      {third && <PodiumPosition member={third} position={3} maxPoints={maxPoints} />}
    </div>
  );
}
