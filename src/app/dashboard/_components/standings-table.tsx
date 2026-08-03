"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { IconTrophy, IconAlertCircle, IconRefresh } from "@tabler/icons-react";

export interface StandingItem {
  standings_id?: number;
  team_id: number;
  played: number;
  win?: number;
  wins?: number;
  loss?: number;
  losses?: number;
  draws?: number;
  no_result?: number;
  points: number;
  net_rr: number;
  last_five_form?: string;
  recent_form?: string | string[];
  teams: {
    team_id: number;
    title: string;
    abbr: string;
    logo_url: string | null;
    thumb_url: string | null;
  };
}

export function StandingsTable() {
  const [standings, setStandings] = useState<StandingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadStandings() {
      try {
        const res = await fetch("/api/v1/standings");
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const json = await res.json();
        if (isMounted) {
          if (json.success) {
            setStandings(json.data);
            setError(null);
          } else {
            setError(json.error || "Failed to load standings");
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadStandings();
    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const parseForm = (form?: string | string[]) => {
    if (!form) return [];
    if (Array.isArray(form)) return form;
    return form
      .split(",")
      .flatMap((s) => s.split(""))
      .filter((c) => c === "W" || c === "L" || c === "D" || c === "N");
  };

  return (
    <Card className="h-full border-border/80 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-xl font-heading font-bold">
            <IconTrophy className="h-5 w-5 text-amber-500" />
            IPL 2022 Standings & Points Table
          </CardTitle>
          <CardDescription>
            Official team rankings, Net Run Rate (NRR), and match form
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setLoading(true);
            setRefreshKey((k) => k + 1);
          }}
          title="Refresh standings"
        >
          <IconRefresh className="h-4 w-4 text-muted-foreground" />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton
                key={`standings-skel-${i}`}
                className="h-12 w-full rounded-none"
              />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-none">
            <IconAlertCircle className="h-8 w-8 text-destructive mb-2" />
            <p className="text-sm font-medium text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setLoading(true);
                setRefreshKey((k) => k + 1);
              }}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-center">P</TableHead>
                <TableHead className="text-center">W</TableHead>
                <TableHead className="text-center">L</TableHead>
                <TableHead className="text-center font-bold text-foreground">
                  Pts
                </TableHead>
                <TableHead className="text-right font-mono">NRR</TableHead>
                <TableHead className="text-center hidden sm:table-cell">
                  Recent Form
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standings.map((item, index) => {
                const rank = index + 1;
                const winsCount = item.wins ?? item.win ?? 0;
                const lossesCount = item.losses ?? item.loss ?? 0;
                const formList = parseForm(
                  item.recent_form ?? item.last_five_form
                );
                const isPlayoffQualifier = rank <= 4;
                const teamId = item.team_id || item.teams?.team_id || index;

                return (
                  <TableRow
                    key={`standing-row-${teamId}-${index}`}
                    className={
                      isPlayoffQualifier
                        ? "bg-primary/5 dark:bg-primary/10 font-medium"
                        : undefined
                    }
                  >
                    <TableCell className="text-center font-mono text-xs">
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-none text-xs font-bold ${
                          rank === 1
                            ? "bg-amber-500 text-amber-950"
                            : isPlayoffQualifier
                              ? "bg-primary/20 text-primary"
                              : "text-muted-foreground"
                        }`}
                      >
                        {rank}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {item.teams?.logo_url ? (
                          <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border bg-background p-0.5">
                            <Image
                              src={item.teams.logo_url}
                              alt={item.teams.title || "Team logo"}
                              fill
                              sizes="28px"
                              className="object-contain"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-xs">
                            {item.teams?.abbr || "TM"}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm leading-none">
                            {item.teams?.title}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {item.teams?.abbr}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      {item.played}
                    </TableCell>
                    <TableCell className="text-center font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      {winsCount}
                    </TableCell>
                    <TableCell className="text-center font-mono text-rose-600 dark:text-rose-400">
                      {lossesCount}
                    </TableCell>
                    <TableCell className="text-center font-mono text-base font-bold text-primary">
                      {item.points}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      <span
                        className={
                          Number(item.net_rr) > 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : Number(item.net_rr) < 0
                              ? "text-rose-600 dark:text-rose-400"
                              : ""
                        }
                      >
                        {Number(item.net_rr) > 0
                          ? `+${item.net_rr}`
                          : item.net_rr}
                      </span>
                    </TableCell>
                    <TableCell className="text-center hidden sm:table-cell">
                      <div className="flex items-center justify-center gap-1.5">
                        {formList.slice(0, 5).map((f, i) => (
                          <Badge
                            key={`form-${teamId}-${i}`}
                            variant={f === "W" ? "win" : "loss"}
                            className="h-5 w-5 p-0 justify-center text-[10px]"
                          >
                            {f}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
