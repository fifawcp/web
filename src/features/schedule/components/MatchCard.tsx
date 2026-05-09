"use client";

import { useState } from "react";
import { MapPin, MoveRight } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

import { useUpdatePick } from "../hooks/useUpdatePick";
import { computeMatchUiState, type MatchUiState } from "../lib/computeMatchUiState";
import { formatKickoffTime } from "../lib/formatKickoffTime";
import type { Match, Team, UserScorePick } from "../types/schedule.types";

import { KickoffCountdown } from "./KickoffCountdown";
import { MatchScorePicker } from "./MatchScorePicker";
import { MatchStatusBadge } from "./MatchStatusBadge";

type Props = {
  match: Match;
  isAuthed: boolean;
};

// Reserve enough vertical space in the score area for the vertical-stacked
// picker so the card height is identical in view and edit modes
const SCORE_AREA_MIN_H = "min-h-[5rem]";

export function MatchCard({ match, isAuthed }: Props) {
  const t = useTranslations("schedule.card");
  const stageT = useTranslations("schedule.filters.stage");
  const locale = useLocale();
  const uiState = computeMatchUiState(match);

  const hasTeams = match.teams.home != null && match.teams.away != null;
  const canEdit = isAuthed && !uiState.isLocked && hasTeams;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<UserScorePick>(() => match.user_score_pick ?? { home_score: 0, away_score: 0 });
  const updatePick = useUpdatePick();

  const startEdit = () => {
    setDraft(match.user_score_pick ?? { home_score: 0, away_score: 0 });
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);
  const save = () => updatePick.mutate({ matchId: match.id, pick: draft }, { onSuccess: () => setEditing(false) });

  return (
    <Card data-match-id={match.id} className={cn("relative gap-3 px-4 py-4", editing && "ring-2 ring-page-accent")} size="sm">
      <header className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium uppercase tracking-wide">{stageHeaderLabel(match, stageT)}</span>
        <KickoffTime kickoffAt={match.kickoff_at} />
      </header>

      <div className={cn("grid grid-cols-[1fr_6rem_1fr] items-center gap-3 sm:grid-cols-[1fr_12rem_1fr]", SCORE_AREA_MIN_H)}>
        <TeamColumn team={match.teams.home} side="home" locale={locale} dim={editing} />
        <ScoreArea
          match={match}
          ui={uiState}
          isAuthed={isAuthed}
          hasTeams={hasTeams}
          editing={editing}
          draft={draft}
          isSaving={updatePick.isPending}
          onDraftChange={setDraft}
          onStartEdit={canEdit ? startEdit : undefined}
        />
        <TeamColumn team={match.teams.away} side="away" locale={locale} dim={editing} />
      </div>

      <footer className="relative -mx-4 pt-4 flex min-h-9 items-center justify-between gap-3 border-t border-border px-4 text-xs text-muted-foreground">
        <span className="inline-flex min-w-0 max-w-[55%] items-center gap-1.5 sm:max-w-none">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">
            {match.venue.name} · {match.venue.city}
          </span>
        </span>
        {editing ? (
          <div className="absolute right-4 flex shrink-0 items-center gap-1.5">
            <Button size="sm" variant="ghost" onClick={cancelEdit} disabled={updatePick.isPending} className="h-[30px] text-xs sm:text-sm cursor-pointer">
              {t("cancel")}
            </Button>
            <Button
              size="sm"
              onClick={save}
              disabled={updatePick.isPending}
              className="h-[30px] cursor-pointer bg-page-accent text-background hover:bg-page-accent-strong text-xs sm:text-sm"
            >
              {t("save")}
            </Button>
          </div>
        ) : (
          <FooterTrailing match={match} ui={uiState} isAuthed={isAuthed} hasTeams={hasTeams} />
        )}
      </footer>
    </Card>
  );
}

function stageHeaderLabel(match: Match, stageT: (key: string) => string): string {
  if (match.stage_code === "group_stage" && match.group_code) return `Group ${match.group_code} · M${match.id}`;
  return `${stageT(match.stage_code)} · M${match.id}`;
}

function KickoffTime({ kickoffAt }: { kickoffAt: string }) {
  return <time dateTime={kickoffAt}>{formatKickoffTime(new Date(kickoffAt))}</time>;
}

function TeamColumn({ team, side, locale, dim }: { team: Team | null; side: "home" | "away"; locale: string; dim?: boolean }) {
  const align = side === "home" ? "items-start text-left" : "items-end text-right";
  const justify = side === "home" ? "justify-start" : "justify-end";

  const flag = team ? (
    <Image src={team.flag_url} alt="" width={40} height={28} sizes="52px" className="size-auto h-6 w-9 shrink-0 rounded-xs object-cover sm:h-9 sm:w-13" />
  ) : (
    <div className="size-auto h-6 w-9 shrink-0 rounded-xs bg-muted sm:h-9 sm:w-13" />
  );

  const label = (
    <div className={cn("flex min-w-0 flex-col leading-tight", align)}>
      {team ? <TeamName team={team} locale={locale} /> : <span className="text-xs font-medium text-foreground sm:text-sm">TBD</span>}
      {team ? <span className="text-2xs uppercase tracking-wide text-muted-foreground">{team.fifa_code}</span> : null}
    </div>
  );

  return (
    <div className={cn("flex min-w-0 items-center gap-1.5 transition-opacity sm:gap-3", justify, dim && "opacity-70")}>
      {side === "home" ? (
        <>
          {flag} {label}
        </>
      ) : (
        <>
          {label} {flag}
        </>
      )}
    </div>
  );
}

function TeamName({ team, locale }: { team: Team; locale: string }) {
  const name = team.name[locale];

  // BIH is too long for a single line, force a wrap before "Herzegovina" so it doesn't get truncated
  if (team.fifa_code === "BIH") {
    const idx = name.indexOf("Herzegovina");
    return (
      <span className="text-xs font-medium leading-tight text-foreground sm:text-sm">
        {name.slice(0, idx).trim()}
        <br />
        Herzegovina
      </span>
    );
  }

  return <span className="truncate text-xs font-medium text-foreground sm:text-sm">{name}</span>;
}

type ScoreAreaProps = {
  match: Match;
  ui: MatchUiState;
  isAuthed: boolean;
  hasTeams: boolean;
  editing: boolean;
  draft: UserScorePick;
  isSaving: boolean;
  onDraftChange: (next: UserScorePick) => void;
  onStartEdit?: () => void;
};

function ScoreArea({ match, ui, isAuthed, hasTeams, editing, draft, isSaving, onDraftChange, onStartEdit }: ScoreAreaProps) {
  const t = useTranslations("schedule.card");

  if (editing) {
    return <MatchScorePicker home={draft.home_score} away={draft.away_score} onChange={onDraftChange} disabled={isSaving} />;
  }

  const result = match.result;
  const pick = match.user_score_pick;
  const canTapToPick = Boolean(onStartEdit);

  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <div className="flex items-center gap-3 text-2xl font-semibold tabular-nums text-foreground">
        <ScoreCell value={result?.home_score} />
        <span className="text-xl text-muted-foreground">&minus;</span>
        <ScoreCell value={result?.away_score} />
      </div>

      {isAuthed && !ui.isFinished && hasTeams && <PickHint pick={pick} canTapToPick={canTapToPick} onClick={onStartEdit} />}

      {isAuthed && ui.isFinished && pick && (
        <span className="text-xs text-muted-foreground">
          {t("yourPick")}:{" "}
          <span className="font-medium tabular-nums">
            {pick.home_score} - {pick.away_score}
          </span>
        </span>
      )}
    </div>
  );
}

function ScoreCell({ value }: { value: number | undefined }) {
  return <span className={cn(value == null && "text-muted-foreground")}>{value ?? "–"}</span>;
}

function PickHint({ pick, canTapToPick, onClick }: { pick: UserScorePick | null; canTapToPick: boolean; onClick?: () => void }) {
  const t = useTranslations("schedule.card");

  if (pick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={!canTapToPick}
        className="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground disabled:cursor-default"
      >
        {t("yourPick")}:{" "}
        <span className="font-medium tabular-nums">
          {pick.home_score} - {pick.away_score}
        </span>
      </button>
    );
  }

  if (!canTapToPick) {
    return <span className="text-xs text-muted-foreground">{t("noPickMade")}</span>;
  }

  return (
    <button type="button" onClick={onClick} className="cursor-pointer text-xs font-semibold text-page-accent transition-colors hover:text-page-accent-strong">
      {t("tapToPick")} <MoveRight className="inline-block size-3.5 shrink-0 align-middle" aria-hidden />
    </button>
  );
}

function FooterTrailing({ match, ui, isAuthed, hasTeams }: { match: Match; ui: MatchUiState; isAuthed: boolean; hasTeams: boolean }) {
  // Picked badge wins over the countdown
  if (isAuthed && ui.hasPick) {
    return <MatchStatusBadge state="picked" />;
  }

  // Pre-kickoff, no pick: show countdown when teams are set or nothing for TBD
  if (!ui.isLocked) {
    return hasTeams ? <KickoffCountdown kickoffAt={match.kickoff_at} /> : null;
  }

  // Locked + no pick: only meaningful for authed users.
  if (!isAuthed) return null;
  return <MatchStatusBadge state="locked" />;
}
