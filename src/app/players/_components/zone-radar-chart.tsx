"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { IconChartRadar, IconTarget } from "@tabler/icons-react";

export interface ZoneDistributionItem {
  zone_id: number;
  zone_name: string | null;
  shot_count: number;
  runs_scored: number;
  fours: number;
  sixes: number;
}

interface ZoneRadarChartProps {
  zoneData: ZoneDistributionItem[];
}

const ZONE_LABELS: Record<number, string> = {
  1: "Fine Leg",
  2: "Square Leg",
  3: "Mid Wicket",
  4: "Long On",
  5: "Long Off",
  6: "Cover",
  7: "Point",
  8: "3rd Man",
};

const chartConfig = {
  runs: {
    label: "Runs Scored",
    color: "var(--color-chart-1)",
  },
  shots: {
    label: "Shots Count",
    color: "var(--color-chart-2)",
  },
} satisfies ChartConfig;

export function ZoneRadarChart({ zoneData }: ZoneRadarChartProps) {
  const chartData = useMemo(() => {
    return [1, 2, 3, 4, 5, 6, 7, 8].map((zoneId) => {
      const found = zoneData.find((z) => z.zone_id === zoneId);
      return {
        zoneId,
        zoneName: found?.zone_name || ZONE_LABELS[zoneId] || `Zone ${zoneId}`,
        runs: found?.runs_scored || 0,
        shots: found?.shot_count || 0,
        fours: found?.fours || 0,
        sixes: found?.sixes || 0,
      };
    });
  }, [zoneData]);

  const dominantZone = useMemo(() => {
    if (!chartData.length) return null;
    return [...chartData].sort((a, b) => b.runs - a.runs)[0];
  }, [chartData]);

  return (
    <Card className="border-border/80 shadow-md h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg font-heading font-bold flex items-center gap-2">
            <IconChartRadar className="h-5 w-5 text-primary" />
            8-Zone Scoring Radar
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Scoring density distribution across the 8 field sectors
          </p>
        </div>

        {dominantZone && dominantZone.runs > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-none bg-primary/10 border border-primary/20 text-xs font-mono text-primary">
            <IconTarget className="h-3.5 w-3.5" />
            <span>
              Strongest Zone: <strong>{dominantZone.zoneName}</strong> (
              {dominantZone.runs} pts)
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6 pt-2 flex-1 flex flex-col justify-between">
        <div className="w-full flex-1 min-h-75 flex items-center justify-center">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <RadarChart
              data={chartData}
              margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
            >
              <PolarGrid stroke="var(--border)" strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="zoneName"
                tick={{
                  fill: "var(--foreground)",
                  fontSize: 11,
                  fontWeight: 500,
                }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, "auto"]}
                stroke="var(--muted-foreground)"
                fontSize={10}
              />
              <ChartTooltip
                content={<ChartTooltipContent indicator="line" />}
              />
              <Radar
                name="Runs Scored"
                dataKey="runs"
                stroke="var(--color-chart-1)"
                fill="var(--color-chart-1)"
                fillOpacity={0.4}
              />
              <Radar
                name="Shots Count"
                dataKey="shots"
                stroke="var(--color-chart-2)"
                fill="var(--color-chart-2)"
                fillOpacity={0.2}
              />
            </RadarChart>
          </ChartContainer>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          {chartData.map((item) => (
            <div
              key={item.zoneId}
              className="p-2.5 rounded-none border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col justify-between"
            >
              <div className="text-[11px] font-mono font-bold text-muted-foreground uppercase truncate">
                {item.zoneName}
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-bold font-mono text-primary">
                  {item.runs}{" "}
                  <span className="text-[10px] font-normal text-muted-foreground">
                    runs
                  </span>
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {item.shots} shots
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground pt-1 border-t border-border/40 mt-1">
                <span className="text-blue-500 font-semibold">
                  {item.fours}x4
                </span>
                <span className="text-amber-500 font-semibold">
                  {item.sixes}x6
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
