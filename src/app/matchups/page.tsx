"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MatchupCharts } from "./_components/matchup-charts";
import { MatchupSelector } from "./_components/matchup-selector";
import {
  H2HMetricsCard,
  type MatchupData,
} from "./_components/h2h-metrics-card";
import { IconSwords, IconAlertTriangle } from "@tabler/icons-react";

export default function MatchupsPage() {
  const [batsmanId, setBatsmanId] = useState<number>(0);
  const [bowlerId, setBowlerId] = useState<number>(0);

  const [matchupData, setMatchupData] = useState<MatchupData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!batsmanId || !bowlerId) return;

    async function fetchMatchup() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/v1/analytics/matchups?batsman_id=${batsmanId}&bowler_id=${bowlerId}`
        );

        if (!res.ok) {
          throw new Error("Failed to load matchup analytics");
        }

        const json = await res.json();
        setMatchupData(json.data);
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "An error occurred fetching matchup stats.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    fetchMatchup();
  }, [batsmanId, bowlerId]);

  return (
    <main className="container mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-heading text-3xl font-extrabold flex items-center gap-2.5">
            <IconSwords className="h-8 w-8 text-primary" />
            Head-to-Head Batter vs Bowler Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analyze historical face-off records, strike rates, dismissals, dot
            ball percentages, and boundary frequencies between any IPL batter
            and bowler.
          </p>
        </div>
      </div>

      <MatchupSelector
        selectedBatsmanId={batsmanId}
        selectedBowlerId={bowlerId}
        onSelectBatsman={(id) => setBatsmanId(id)}
        onSelectBowler={(id) => setBowlerId(id)}
      />

      {!batsmanId || !bowlerId ? (
        <Card className="p-12 border-dashed text-center space-y-3 bg-card/50">
          <IconSwords className="h-10 w-10 text-muted-foreground/40 mx-auto" />
          <h3 className="text-base font-bold font-heading">
            No Matchup Selected
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Select a Batsman and Bowler above or click on one of the Top Rivalry
            presets to view historical Head-to-Head analytics.
          </p>
        </Card>
      ) : loading ? (
        <div className="space-y-6">
          <Skeleton className="h-28 w-full rounded-none" />
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-none" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-72 w-full rounded-none" />
            <Skeleton className="h-72 w-full rounded-none" />
          </div>
        </div>
      ) : error ? (
        <div className="p-8 border border-destructive/40 bg-destructive/5 rounded-none text-center space-y-2">
          <IconAlertTriangle className="h-10 w-10 text-destructive mx-auto" />
          <h3 className="text-sm font-bold">Failed to Load Matchup</h3>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      ) : matchupData ? (
        <div className="space-y-8">
          <H2HMetricsCard data={matchupData} />
          <MatchupCharts data={matchupData} />
        </div>
      ) : null}
    </main>
  );
}
