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
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { IconChartLine, IconAlertCircle } from "@tabler/icons-react";

interface WormRow {
  inning_id: number;
  inning_number: number;
  team_name: string;
  over_number: number;
  runs_in_over: number;
  cumulative_runs: number;
  wickets_in_over: number;
  cumulative_wickets: number;
}

export function WormChart({ matchId }: { matchId: number }) {
  const [wormData, setWormData] = useState<WormRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/v1/matches/${matchId}/worm`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setWormData(json.data);
        } else {
          throw new Error(json.error || "Failed to load worm chart data");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [matchId]);

  if (loading) return <Skeleton className="h-72 w-full rounded-none" />;
  if (error || !wormData.length) {
    return (
      <Card className="border-border/80 p-6 text-center text-xs text-muted-foreground flex flex-col items-center justify-center h-72">
        <IconAlertCircle className="h-6 w-6 text-muted-foreground mb-2" />
        No over-by-over worm chart data available for this match.
      </Card>
    );
  }

  const teamInning1 =
    wormData.find((d) => d.inning_number === 1)?.team_name || "Innings 1";
  const teamInning2 =
    wormData.find((d) => d.inning_number === 2)?.team_name || "Innings 2";

  const chartDataMap: Record<
    number,
    {
      over: number;
      team1Runs?: number;
      team2Runs?: number;
      team1Wkts?: number;
      team2Wkts?: number;
    }
  > = {};

  for (let i = 1; i <= 20; i++) {
    chartDataMap[i] = { over: i };
  }

  wormData.forEach((row) => {
    if (!chartDataMap[row.over_number]) {
      chartDataMap[row.over_number] = { over: row.over_number };
    }
    if (row.inning_number === 1) {
      chartDataMap[row.over_number].team1Runs = row.cumulative_runs;
      chartDataMap[row.over_number].team1Wkts = row.cumulative_wickets;
    } else if (row.inning_number === 2) {
      chartDataMap[row.over_number].team2Runs = row.cumulative_runs;
      chartDataMap[row.over_number].team2Wkts = row.cumulative_wickets;
    }
  });

  const chartData = Object.values(chartDataMap).sort((a, b) => a.over - b.over);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl font-heading font-bold">
          <IconChartLine className="h-5 w-5 text-sky-500" />
          Innings Worm Chart
        </CardTitle>
        <CardDescription>
          Cumulative run progression & comparative chase trajectory over 20
          overs
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 20, left: -10, bottom: 20 }}
            >
              <defs>
                <linearGradient id="team1Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="oklch(0.609 0.126 221.723)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="oklch(0.609 0.126 221.723)"
                    stopOpacity={0.0}
                  />
                </linearGradient>
                <linearGradient id="team2Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="oklch(0.865 0.127 207.078)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="oklch(0.865 0.127 207.078)"
                    stopOpacity={0.0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="over"
                label={{
                  value: "Overs",
                  position: "insideBottom",
                  offset: -5,
                  fontSize: 11,
                }}
                tick={{ fontSize: 11 }}
                height={35}
              />
              <YAxis
                label={{
                  value: "Runs",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 11,
                }}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                cursor={{
                  stroke: "rgba(255, 255, 255, 0.2)",
                  strokeDasharray: "3 3",
                }}
                contentStyle={{
                  backgroundColor: "var(--color-popover)",
                  borderColor: "var(--color-border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ fontSize: "12px", paddingBottom: "8px" }}
              />
              <Area
                type="monotone"
                dataKey="team1Runs"
                name={`${teamInning1} Runs`}
                stroke="oklch(0.609 0.126 221.723)"
                fillOpacity={1}
                fill="url(#team1Gradient)"
                strokeWidth={2.5}
              />
              <Area
                type="monotone"
                dataKey="team2Runs"
                name={`${teamInning2} Runs`}
                stroke="oklch(0.865 0.127 207.078)"
                fillOpacity={1}
                fill="url(#team2Gradient)"
                strokeWidth={2.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
