"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  IconTarget,
  IconCricket,
  IconFlame,
  IconPercentage,
  IconAward,
} from "@tabler/icons-react";

export interface MatchupData {
  batsman_id: number;
  batsman_name: string | null;
  batsman_short_name?: string | null;
  bowler_id: number;
  bowler_name: string | null;
  bowler_short_name?: string | null;
  balls_faced: number;
  total_runs: number;
  dismissals: number;
  dot_balls: number;
  fours: number;
  sixes: number;
  strike_rate: number;
  dot_ball_percentage: number;
}

interface H2HMetricsCardProps {
  data: MatchupData;
}

export function H2HMetricsCard({ data }: H2HMetricsCardProps) {
  const verdict = useMemo(() => {
    if (!data.balls_faced) {
      return {
        label: "No IPL Face-off Record",
        description:
          "These two players have not faced each other in the recorded dataset.",
        variant: "secondary" as const,
        color: "text-muted-foreground",
        badgeBg: "bg-muted text-muted-foreground",
      };
    }

    if (
      data.dismissals >= 2 ||
      (data.strike_rate < 115 && data.balls_faced >= 10)
    ) {
      return {
        label: `${data.bowler_short_name || data.bowler_name || "Bowler"} Has The Edge (Bowler Nemesis)`,
        description: `${data.bowler_short_name || data.bowler_name} has restricted the batter effectively with ${data.dismissals} dismissal(s) and a modest strike rate of ${data.strike_rate.toFixed(1)}.`,
        variant: "destructive" as const,
        color: "text-rose-500",
        badgeBg:
          "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
      };
    }

    if (data.strike_rate >= 145 && data.dismissals <= 1) {
      return {
        label: `${data.batsman_short_name || data.batsman_name || "Batter"} Dominates (Batter Mastery)`,
        description: `${data.batsman_short_name || data.batsman_name} attacks aggressive against this bowler with a high strike rate of ${data.strike_rate.toFixed(1)} and ${data.sixes} sixes.`,
        variant: "default" as const,
        color: "text-emerald-500",
        badgeBg:
          "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      };
    }

    return {
      label: "Balanced Rivalry",
      description:
        "Evenly contested head-to-head battle with consistent scoring and tactical parity.",
      variant: "outline" as const,
      color: "text-amber-500",
      badgeBg:
        "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    };
  }, [data]);

  return (
    <div className="space-y-6">
      <Card className="border-border/80 shadow-md bg-linear-to-r from-card via-card/95 to-muted/20">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                className={`font-mono text-xs font-bold px-3 py-1 border ${verdict.badgeBg}`}
              >
                <IconFlame className="h-3.5 w-3.5 mr-1" />
                {verdict.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
              {verdict.description}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono shrink-0 bg-muted/40 p-3 rounded-none border border-border/50">
            <div>
              <span className="text-[10px] text-muted-foreground block">
                FACE-OFF BALLS
              </span>
              <span className="font-bold text-base text-foreground">
                {data.balls_faced}
              </span>
            </div>
            <div className="border-l border-border/60 pl-3">
              <span className="text-[10px] text-muted-foreground block">
                STRIKE RATE
              </span>
              <span className="font-bold text-base text-primary">
                {data.strike_rate ? data.strike_rate.toFixed(1) : "0.0"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-border/80 shadow-xs hover:border-primary/40 transition-colors">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-mono uppercase font-bold">
                Runs Scored
              </span>
              <IconCricket className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold font-mono text-foreground">
              {data.total_runs}
            </div>
            <p className="text-[10px] text-muted-foreground">
              off {data.balls_faced} deliveries
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs hover:border-primary/40 transition-colors">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-mono uppercase font-bold">
                Strike Rate
              </span>
              <IconFlame className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold font-mono text-primary">
              {data.strike_rate ? data.strike_rate.toFixed(1) : "0.0"}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Runs per 100 balls
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs hover:border-primary/40 transition-colors">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-mono uppercase font-bold">
                Dismissals
              </span>
              <IconTarget className="h-4 w-4 text-rose-500" />
            </div>
            <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {data.dismissals}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Times out to bowler
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs hover:border-primary/40 transition-colors">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-mono uppercase font-bold">
                Dot Ball %
              </span>
              <IconPercentage className="h-4 w-4 text-sky-500" />
            </div>
            <div className="text-2xl font-bold font-mono text-foreground">
              {data.dot_ball_percentage
                ? `${data.dot_ball_percentage.toFixed(1)}%`
                : "0.0%"}
            </div>
            <p className="text-[10px] text-muted-foreground">
              {data.dot_balls} scoreless balls
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs hover:border-primary/40 transition-colors">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-mono uppercase font-bold">
                Fours (4s)
              </span>
              <IconAward className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              {data.fours}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Ground boundaries
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs hover:border-primary/40 transition-colors">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-mono uppercase font-bold">
                Sixes (6s)
              </span>
              <IconFlame className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">
              {data.sixes}
            </div>
            <p className="text-[10px] text-muted-foreground">Maximums hit</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
