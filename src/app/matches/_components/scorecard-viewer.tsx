"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { IconCricket, IconAlertCircle } from "@tabler/icons-react";

interface BatsmanRow {
  scorecard_batsman_id: number;
  batsman_id: number;
  batting_position: number;
  runs: number;
  balls_faced: number;
  fours: number;
  sixes: number;
  strike_rate: number | null;
  how_out: string | null;
  dismissal_text: string | null;
  players_scorecard_batsmen_batsman_idToplayers: {
    player_id: number;
    title: string;
    short_name: string | null;
  };
}

interface BowlerRow {
  scorecard_bowler_id: number;
  bowler_id: number;
  overs: number;
  maidens: number;
  runs_conceded: number;
  wickets: number;
  economy: number | null;
  dot_balls: number | null;
  players: {
    player_id: number;
    title: string;
    short_name: string | null;
  };
}

interface InningData {
  inning_id: number;
  inning_number: number;
  runs: number;
  wickets: number;
  overs: number;
  teams_match_innings_batting_team_idToteams: {
    team_id: number;
    title: string;
    abbr: string;
  };
  teams_match_innings_fielding_team_idToteams: {
    team_id: number;
    title: string;
    abbr: string;
  };
  scorecard_batsmen: BatsmanRow[];
  scorecard_bowlers: BowlerRow[];
}

export function ScorecardViewer({ matchId }: { matchId: number }) {
  const [innings, setInnings] = useState<InningData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch(`/api/v1/matches/${matchId}/scorecard`)
      .then((res) => res.json())
      .then((json) => {
        if (isMounted) {
          if (json.success) {
            setInnings(json.data);
            setError(null);
          } else {
            throw new Error(json.error || "Failed to load scorecard");
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

  if (loading) return <Skeleton className="h-96 w-full rounded-none" />;
  if (error) {
    return (
      <Card className="border-destructive/30 bg-destructive/5 p-6 text-center">
        <IconAlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
        <p className="text-sm text-destructive">{error}</p>
      </Card>
    );
  }
  if (!innings.length) return null;

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl font-heading font-bold">
          <IconCricket className="h-5 w-5 text-primary" />
          Full Match Scorecard
        </CardTitle>
        <CardDescription>
          Detailed batting dismissals, strike rates, and bowling economies for
          both innings
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="inning-1">
          <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
            {innings.map((inn) => (
              <TabsTrigger
                key={`trigger-${inn.inning_id}`}
                value={`inning-${inn.inning_number}`}
                className="gap-2 text-xs"
              >
                <span>
                  {inn.teams_match_innings_batting_team_idToteams?.abbr ||
                    `Inning ${inn.inning_number}`}
                </span>
                <Badge
                  variant="outline"
                  className="font-mono text-[10px] px-1.5 py-0"
                >
                  {inn.runs}/{inn.wickets} ({inn.overs}ov)
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {innings.map((inn) => (
            <TabsContent
              key={`content-${inn.inning_id}`}
              value={`inning-${inn.inning_number}`}
              className="space-y-6"
            >
              <div>
                <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center justify-between">
                  <span>
                    Batting —{" "}
                    {inn.teams_match_innings_batting_team_idToteams?.title}
                  </span>
                  <span className="text-foreground">
                    {inn.runs}/{inn.wickets} in {inn.overs} Overs
                  </span>
                </h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batter</TableHead>
                      <TableHead>Dismissal</TableHead>
                      <TableHead className="text-right font-bold text-foreground">
                        R
                      </TableHead>
                      <TableHead className="text-right">B</TableHead>
                      <TableHead className="text-right">4s</TableHead>
                      <TableHead className="text-right">6s</TableHead>
                      <TableHead className="text-right font-mono">SR</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inn.scorecard_batsmen.map((b, idx) => {
                      const player =
                        b.players_scorecard_batsmen_batsman_idToplayers;
                      const sr =
                        b.strike_rate ||
                        (b.balls_faced > 0
                          ? ((b.runs / b.balls_faced) * 100).toFixed(1)
                          : "0.0");

                      return (
                        <TableRow
                          key={`batsman-${inn.inning_id}-${b.scorecard_batsman_id || b.batsman_id}-${idx}`}
                        >
                          <TableCell className="font-medium">
                            <Link
                              href={`/players/${b.batsman_id}`}
                              className="hover:text-primary hover:underline transition-colors"
                            >
                              {player?.title || `Player #${b.batsman_id}`}
                            </Link>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {b.dismissal_text || b.how_out || "not out"}
                          </TableCell>
                          <TableCell className="text-right font-mono font-bold text-base text-foreground">
                            {b.runs}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {b.balls_faced}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs text-muted-foreground">
                            {b.fours}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs text-sky-500 font-semibold">
                            {b.sixes}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs text-muted-foreground">
                            {sr}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="pt-6 border-t border-border/60">
                <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Bowling —{" "}
                  {inn.teams_match_innings_fielding_team_idToteams?.title}
                </h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bowler</TableHead>
                      <TableHead className="text-right">O</TableHead>
                      <TableHead className="text-right">M</TableHead>
                      <TableHead className="text-right">R</TableHead>
                      <TableHead className="text-right font-bold text-foreground">
                        W
                      </TableHead>
                      <TableHead className="text-right font-mono">
                        Econ
                      </TableHead>
                      <TableHead className="text-right hidden sm:table-cell">
                        Dots
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inn.scorecard_bowlers.map((bw, idx) => {
                      const player = bw.players;
                      const econ =
                        bw.economy ||
                        (bw.overs > 0
                          ? (bw.runs_conceded / bw.overs).toFixed(2)
                          : "0.00");

                      return (
                        <TableRow
                          key={`bowler-${inn.inning_id}-${bw.scorecard_bowler_id || bw.bowler_id}-${idx}`}
                        >
                          <TableCell className="font-medium">
                            <Link
                              href={`/players/${bw.bowler_id}`}
                              className="hover:text-primary hover:underline transition-colors"
                            >
                              {player?.title || `Player #${bw.bowler_id}`}
                            </Link>
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {bw.overs}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {bw.maidens}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {bw.runs_conceded}
                          </TableCell>
                          <TableCell className="text-right font-mono font-bold text-base text-purple-500">
                            {bw.wickets}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs text-muted-foreground">
                            {econ}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs text-muted-foreground hidden sm:table-cell">
                            {bw.dot_balls || "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
