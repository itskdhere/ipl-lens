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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { IconBuildingSkyscraper, IconAlertCircle } from "@tabler/icons-react";

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

export function ManhattanChart({ matchId }: { matchId: number }) {
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
          throw new Error(json.error || "Failed to load Manhattan chart data");
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
        No Manhattan chart over data available for this match.
      </Card>
    );
  }

  const teamInning1 =
    wormData.find((d) => d.inning_number === 1)?.team_name || "Innings 1";
  const teamInning2 =
    wormData.find((d) => d.inning_number === 2)?.team_name || "Innings 2";

  const chartDataMap: Record<
    number,
    { over: number; team1Runs?: number; team2Runs?: number }
  > = {};
  for (let i = 1; i <= 20; i++) {
    chartDataMap[i] = { over: i };
  }

  wormData.forEach((row) => {
    if (!chartDataMap[row.over_number]) {
      chartDataMap[row.over_number] = { over: row.over_number };
    }
    if (row.inning_number === 1) {
      chartDataMap[row.over_number].team1Runs = row.runs_in_over;
    } else if (row.inning_number === 2) {
      chartDataMap[row.over_number].team2Runs = row.runs_in_over;
    }
  });

  const chartData = Object.values(chartDataMap).sort((a, b) => a.over - b.over);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl font-heading font-bold">
          <IconBuildingSkyscraper className="h-5 w-5 text-purple-500" />
          Manhattan Over-by-Over Chart
        </CardTitle>
        <CardDescription>
          Comparison of runs scored per over across both innings
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 20, left: -10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="over"
                label={{
                  value: "Over Number",
                  position: "insideBottom",
                  offset: -5,
                  fontSize: 11,
                }}
                tick={{ fontSize: 11 }}
                height={35}
              />
              <YAxis
                label={{
                  value: "Runs in Over",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 11,
                }}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                cursor={{ fill: "var(--color-muted)", opacity: 0.5 }}
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
              <Bar
                dataKey="team1Runs"
                name={teamInning1}
                fill="oklch(0.609 0.126 221.723)"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="team2Runs"
                name={teamInning2}
                fill="oklch(0.715 0.143 215.221)"
                radius={[0, 0, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
