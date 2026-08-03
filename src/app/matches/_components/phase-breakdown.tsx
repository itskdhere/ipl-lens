"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { IconFlame, IconTarget, IconBolt } from "@tabler/icons-react";

interface PhaseAnalyticsRow {
  inning_id: number;
  inning_number: number;
  team_name: string;
  match_phase: string;
  runs_scored: number;
  wickets_lost: number;
  legal_balls_faced: number;
  fours: number;
  sixes: number;
  run_rate: number;
}

export function PhaseBreakdown({ matchId }: { matchId: number }) {
  const [phaseData, setPhaseData] = useState<PhaseAnalyticsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch(`/api/v1/matches/${matchId}/phase-analytics`)
      .then((res) => res.json())
      .then((json) => {
        if (isMounted) {
          if (json.success) {
            setPhaseData(json.data);
            setError(null);
          } else {
            throw new Error(json.error || "Failed to load phase analytics");
          }
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [matchId]);

  if (loading) return <Skeleton className="h-48 w-full rounded-none" />;
  if (error || !phaseData.length) {
    return (
      <Card className="border-border/80 p-6 text-center text-xs text-muted-foreground">
        No phase breakdown analytics available for this match.
      </Card>
    );
  }

  const phases = [
    "Powerplay (Overs 1-6)",
    "Middle Overs (Overs 7-15)",
    "Death Overs (Overs 16-20)",
  ];

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl font-heading font-bold">
          <IconFlame className="h-5 w-5 text-amber-500" />
          Match Phase Breakdown Analytics
        </CardTitle>
        <CardDescription>
          Performance analysis across Powerplay (1-6), Middle (7-15), and Death
          overs (16-20)
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {phases.map((phaseTitle, idx) => {
            const phaseRows = phaseData.filter(
              (p) => p.match_phase === phaseTitle
            );
            const icon =
              idx === 0 ? (
                <IconBolt className="h-4 w-4 text-amber-500" />
              ) : idx === 1 ? (
                <IconTarget className="h-4 w-4 text-sky-500" />
              ) : (
                <IconFlame className="h-4 w-4 text-rose-500" />
              );

            return (
              <div
                key={`phase-column-${phaseTitle}`}
                className="flex flex-col gap-3 p-4 rounded-none border border-border/60 bg-muted/20"
              >
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <div className="flex items-center gap-2 font-semibold text-xs text-foreground">
                    {icon}
                    <span>{phaseTitle}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {phaseRows.map((row, rIdx) => (
                    <div
                      key={`phase-row-${row.inning_id}-${row.team_name}-${rIdx}`}
                      className="flex items-center justify-between text-xs p-2 rounded-none bg-card border border-border/40"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">
                          {row.team_name}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          RR: {row.run_rate} • 4s/6s: {row.fours}/{row.sixes}
                        </span>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="font-mono font-extrabold text-sm text-primary">
                          {row.runs_scored}/{row.wickets_lost}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          ({row.legal_balls_faced} balls)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
