"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { IconChartBar, IconGauge } from "@tabler/icons-react";
import type { MatchupData } from "./h2h-metrics-card";

interface MatchupChartsProps {
  data: MatchupData;
}

const chartConfig = {
  count: {
    label: "Deliveries / Events",
    color: "var(--color-chart-1)",
  },
} satisfies ChartConfig;

export function MatchupCharts({ data }: MatchupChartsProps) {
  const singlesDoubles = Math.max(
    0,
    data.balls_faced -
      (data.dot_balls + data.fours + data.sixes + data.dismissals)
  );

  const breakdownData = useMemo(() => {
    return [
      { type: "Dot Balls (0s)", count: data.dot_balls, color: "#64748b" }, // Slate
      { type: "Singles/Doubles", count: singlesDoubles, color: "#10b981" }, // Emerald
      { type: "Boundaries (4s)", count: data.fours, color: "#3b82f6" }, // Blue
      { type: "Sixes (6s)", count: data.sixes, color: "#f59e0b" }, // Amber
      { type: "Dismissals", count: data.dismissals, color: "#f43f5e" }, // Rose
    ];
  }, [data, singlesDoubles]);

  const srPercentage = Math.min(
    100,
    Math.round((data.strike_rate / 200) * 100)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      <Card className="lg:col-span-7 border-border/80 shadow-md h-full flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-heading font-bold flex items-center gap-2">
            <IconChartBar className="h-5 w-5 text-primary" />
            Delivery & Shot Outcome Breakdown
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Distribution of ball outcomes faced by the batter against this
            bowler
          </p>
        </CardHeader>
        <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
          <div className="w-full h-60 pt-2">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <BarChart
                data={breakdownData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="type"
                  tick={{ fontSize: 10, fill: "var(--foreground)" }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                />
                <ChartTooltip
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar dataKey="count" radius={[0, 0, 0, 0]}>
                  {breakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono pt-1">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-none bg-slate-500"></span>
              <span>Dots ({data.dot_balls})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-none bg-emerald-500"></span>
              <span>1s/2s ({singlesDoubles})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-none bg-blue-500"></span>
              <span>4s ({data.fours})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-none bg-amber-500"></span>
              <span>6s ({data.sixes})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-none bg-rose-500"></span>
              <span>Wickets ({data.dismissals})</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-5 border-border/80 shadow-md h-full flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-heading font-bold flex items-center gap-2">
            <IconGauge className="h-5 w-5 text-primary" />
            Strike Rate Efficiency Gauge
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Batter&apos;s strike rate in this matchup relative to T20 benchmarks
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-2 flex-1 flex flex-col justify-between">
          <div className="text-center space-y-1">
            <div className="text-4xl font-extrabold font-mono tracking-tight text-primary">
              {data.strike_rate ? data.strike_rate.toFixed(1) : "0.0"}
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              H2H Strike Rate ({data.total_runs} runs off {data.balls_faced}{" "}
              balls)
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-muted-foreground">
              <span>0 SR (Anchor)</span>
              <span>135 SR (Average)</span>
              <span>200+ SR (Explosive)</span>
            </div>
            <div className="h-3.5 w-full bg-muted rounded-none overflow-hidden p-0.5 border border-border">
              <div
                className="h-full bg-linear-to-r from-blue-500 via-emerald-500 to-amber-500 rounded-none transition-all duration-500"
                style={{ width: `${srPercentage}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-none bg-muted/30 border border-border/50 text-center space-y-1">
              <span className="text-[10px] font-mono text-muted-foreground block">
                BOUNDARY FREQUENCY
              </span>
              <span className="text-sm font-bold font-mono text-foreground">
                {data.fours + data.sixes > 0
                  ? `Every ${(data.balls_faced / (data.fours + data.sixes)).toFixed(1)} balls`
                  : "No Boundaries"}
              </span>
            </div>
            <div className="p-3 rounded-none bg-muted/30 border border-border/50 text-center space-y-1">
              <span className="text-[10px] font-mono text-muted-foreground block">
                AVERAGE RUNS/OUT
              </span>
              <span className="text-sm font-bold font-mono text-foreground">
                {data.dismissals > 0
                  ? (data.total_runs / data.dismissals).toFixed(1)
                  : `${data.total_runs} (Unbeaten)`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
