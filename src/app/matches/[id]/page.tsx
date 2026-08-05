"use client";

import { useEffect, useState, use } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WormChart } from "../_components/worm-chart";
import { ManhattanChart } from "../_components/manhattan-chart";
import { PhaseBreakdown } from "../_components/phase-breakdown";
import { ScorecardViewer } from "../_components/scorecard-viewer";
import { MatchHeader, MatchDetailData } from "../_components/match-header";
import { IconAlertCircle } from "@tabler/icons-react";

export default function MatchDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const matchId = Number(resolvedParams.id);

  const [match, setMatch] = useState<MatchDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMatch() {
      if (!matchId || isNaN(matchId)) {
        if (isMounted) {
          setError("Invalid Match ID");
          setLoading(false);
        }
        return;
      }

      try {
        const res = await fetch(`/api/v1/matches/${matchId}`);
        const json = await res.json();
        if (isMounted) {
          if (json.success) {
            setMatch(json.data);
            setError(null);
          } else {
            setError(json.error || "Match not found");
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Error loading match");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadMatch();
    return () => {
      isMounted = false;
    };
  }, [matchId]);

  if (loading) {
    return (
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <Skeleton className="h-64 w-full rounded-none" />
        <Skeleton className="h-44 w-full rounded-none" />
        <Skeleton className="h-96 w-full rounded-none" />
      </main>
    );
  }

  if (error || !match) {
    return (
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <Card className="max-w-lg mx-auto border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
          <IconAlertCircle className="h-10 w-10 text-destructive mx-auto" />
          <h2 className="text-lg font-bold text-destructive">
            Match Not Found
          </h2>
          <p className="text-sm text-muted-foreground">
            {error || "Could not retrieve match details."}
          </p>
        </Card>
      </main>
    );
  }

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <MatchHeader match={match} />

      <PhaseBreakdown matchId={matchId} />

      <div className="space-y-8">
        <WormChart matchId={matchId} />
        <ManhattanChart matchId={matchId} />
      </div>

      <ScorecardViewer matchId={matchId} />
    </main>
  );
}
