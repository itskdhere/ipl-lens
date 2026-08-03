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
import { IconBuildingStadium, IconAlertCircle } from "@tabler/icons-react";

interface VenueStatRow {
  venue_id: number;
  venue_name: string;
  location: string | null;
  country: string | null;
  matches_played: number;
  avg_first_innings_score: number | null;
  avg_second_innings_score: number | null;
  toss_elected_bat_count: number;
  toss_elected_bowl_count: number;
}

export function TossVenueAnalytics() {
  const [venues, setVenues] = useState<VenueStatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadVenueAnalytics() {
      try {
        const res = await fetch("/api/v1/venues");
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const json = await res.json();
        if (isMounted) {
          if (json.success) {
            setVenues(json.data);
            setError(null);
          } else {
            setError(json.error || "Failed to load venue analytics");
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

    loadVenueAnalytics();
    return () => {
      isMounted = false;
    };
  }, []);

  const chartData = venues.slice(0, 6).map((v) => ({
    name: v.venue_name.split(",")[0].trim(),
    avg1st: Math.round(v.avg_first_innings_score || 0),
    avg2nd: Math.round(v.avg_second_innings_score || 0),
    batFirst: v.toss_elected_bat_count,
    bowlFirst: v.toss_elected_bowl_count,
  }));

  return (
    <Card className="h-full border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl font-heading font-bold">
          <IconBuildingStadium className="h-5 w-5 text-emerald-500" />
          Venue & Toss Analytics
        </CardTitle>
        <CardDescription>
          Average 1st vs 2nd Innings scores & toss decisions across IPL venues
        </CardDescription>
      </CardHeader>

      <CardContent>
        {loading ? (
          <Skeleton className="h-72 w-full rounded-none" />
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-none">
            <IconAlertCircle className="h-8 w-8 text-destructive mb-2" />
            <p className="text-sm font-medium text-destructive">{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Average Score: 1st vs 2nd Innings
              </h4>
              <div className="h-100 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 90 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={90}
                    />
                    <YAxis tick={{ fontSize: 11 }} domain={[100, 220]} />
                    <Tooltip
                      cursor={{ fill: "var(--color-muted)", opacity: 0.5 }}
                      contentStyle={{
                        backgroundColor: "var(--color-popover)",
                        borderColor: "var(--color-border)",
                        borderRadius: "0px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      wrapperStyle={{ fontSize: "12px", paddingBottom: "8px" }}
                    />
                    <Bar
                      dataKey="avg1st"
                      name="1st Innings Avg"
                      fill="oklch(0.609 0.126 221.723)"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="avg2nd"
                      name="2nd Innings Avg"
                      fill="oklch(0.715 0.143 215.221)"
                      radius={[0, 0, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Toss Choices: Bat vs Bowl
              </h4>
              <div className="h-100 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 90 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={90}
                    />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      cursor={{ fill: "var(--color-muted)", opacity: 0.5 }}
                      contentStyle={{
                        backgroundColor: "var(--color-popover)",
                        borderColor: "var(--color-border)",
                        borderRadius: "0px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      wrapperStyle={{ fontSize: "12px", paddingBottom: "8px" }}
                    />
                    <Bar
                      dataKey="batFirst"
                      name="Elected Bat"
                      fill="oklch(0.865 0.127 207.078)"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="bowlFirst"
                      name="Elected Bowl"
                      fill="oklch(0.52 0.105 223.128)"
                      radius={[0, 0, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
