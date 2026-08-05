import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  IconCalendar,
  IconMapPin,
  IconTrophy,
  IconArrowLeft,
  IconUser,
  IconCoin,
} from "@tabler/icons-react";
import { formatDate } from "@/lib/utils";

export interface MatchDetailData {
  match_id: number;
  title: string;
  short_title: string;
  subtitle: string | null;
  match_number: string | null;
  status_str: string;
  status_note: string | null;
  date_start: string;
  date_start_ist: string | null;
  toss_text: string | null;
  teama_score: string | null;
  teamb_score: string | null;
  teama_overs: string | null;
  teamb_overs: string | null;
  venues?: { name: string; location: string | null };
  teams_matches_teama_idToteams?: {
    team_id: number;
    title: string;
    abbr: string;
    logo_url: string | null;
  };
  teams_matches_teamb_idToteams?: {
    team_id: number;
    title: string;
    abbr: string;
    logo_url: string | null;
  };
  teams_matches_winning_team_idToteams?: {
    team_id: number;
    title: string;
    abbr: string;
  };
  players?: { player_id: number; title: string; short_name: string | null };
  umpires?: string | null;
}

export function MatchHeader({ match }: { match: MatchDetailData }) {
  const teamA = match.teams_matches_teama_idToteams;
  const teamB = match.teams_matches_teamb_idToteams;
  const motm = match.players;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/matches">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-muted-foreground"
          >
            <IconArrowLeft className="h-4 w-4" />
            Back to All Matches
          </Button>
        </Link>
        <Badge variant="outline" className="font-mono text-xs">
          Match #{match.match_number || match.match_id}
        </Badge>
      </div>

      <Card className="border-border/80 bg-linear-to-br from-card via-card to-muted/20 shadow-md">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground pb-4 border-b border-border/40 font-mono">
            <span className="flex items-center gap-1.5">
              <IconCalendar className="h-4 w-4 text-primary" />
              {formatDate(match.date_start_ist || match.date_start)}
            </span>
            <span className="flex items-center gap-1.5">
              <IconMapPin className="h-4 w-4 text-primary" />
              {match.venues?.name || "TBA"}
            </span>
            <Badge variant="secondary" className="text-xs">
              {match.status_str}
            </Badge>
          </div>

          <div className="grid grid-cols-12 items-center gap-4 py-2">
            <div className="col-span-5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              {teamA?.logo_url ? (
                <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-full border bg-background p-1 shadow-sm">
                  <Image
                    src={teamA.logo_url}
                    alt={teamA.title}
                    fill
                    sizes="64px"
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xl">
                  {teamA?.abbr || "A"}
                </div>
              )}
              <div className="flex flex-col">
                <h2 className="font-heading text-xl sm:text-2xl font-bold">
                  {teamA?.title}
                </h2>
                <div className="font-mono text-lg sm:text-xl font-extrabold text-primary">
                  {match.teama_score || "N/A"}{" "}
                  {match.teama_overs && (
                    <span className="text-xs font-normal text-muted-foreground">
                      ({match.teama_overs} ov)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="col-span-2 flex flex-col items-center justify-center">
              <span className="font-mono text-sm font-extrabold text-muted-foreground/60 bg-muted px-3 py-1 rounded-none border">
                VS
              </span>
            </div>

            <div className="col-span-5 flex flex-col-reverse sm:flex-row items-center justify-end gap-4 text-center sm:text-right">
              <div className="flex flex-col">
                <h2 className="font-heading text-xl sm:text-2xl font-bold">
                  {teamB?.title}
                </h2>
                <div className="font-mono text-lg sm:text-xl font-extrabold text-primary">
                  {match.teamb_score || "N/A"}{" "}
                  {match.teamb_overs && (
                    <span className="text-xs font-normal text-muted-foreground">
                      ({match.teamb_overs} ov)
                    </span>
                  )}
                </div>
              </div>
              {teamB?.logo_url ? (
                <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-full border bg-background p-1 shadow-sm">
                  <Image
                    src={teamB.logo_url}
                    alt={teamB.title}
                    fill
                    sizes="64px"
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xl">
                  {teamB?.abbr || "B"}
                </div>
              )}
            </div>
          </div>

          {match.status_note && (
            <div className="flex items-center justify-center gap-2 p-3 rounded-none bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold text-sm border border-emerald-500/30 text-center">
              <IconTrophy className="h-5 w-5 shrink-0" />
              <span>{match.status_note}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border/40 text-xs text-muted-foreground font-mono">
            {match.toss_text && (
              <span className="flex items-center gap-1.5">
                <IconCoin className="h-4 w-4 text-amber-500" />
                Toss: {match.toss_text}
              </span>
            )}
            {motm && (
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <IconUser className="h-4 w-4 text-purple-500" />
                Player of the Match:{" "}
                <Link
                  href={`/players/${motm.player_id}`}
                  className="underline hover:text-primary"
                >
                  {motm.title}
                </Link>
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
