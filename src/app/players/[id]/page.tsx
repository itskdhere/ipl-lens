"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { PlayerHeader } from "../_components/player-header";
import { ZoneRadarChart } from "../_components/zone-radar-chart";
import { PlayerCareerTable } from "../_components/player-career-table";
import { WagonWheel, type ShotPoint } from "../_components/wagon-wheel";
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconUser,
} from "@tabler/icons-react";

interface PlayerPageProps {
  params: Promise<{ id: string }>;
}

export default function PlayerDetailsPage({ params }: PlayerPageProps) {
  const { id } = use(params);
  const playerId = parseInt(id, 10);

  const [player, setPlayer] = useState<Record<string, unknown> | null>(null);
  const [careerStats, setCareerStats] = useState<Record<string, unknown>[]>([]);
  const [shots, setShots] = useState<ShotPoint[]>([]);
  const [zoneDistribution, setZoneDistribution] = useState<
    Record<string, unknown>[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [matchFilter, setMatchFilter] = useState<string>("all");
  const [zoneFilter, setZoneFilter] = useState<string>("all");

  useEffect(() => {
    if (isNaN(playerId)) {
      const timer = setTimeout(() => {
        setError("Invalid Player ID");
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    async function loadPlayerData() {
      setLoading(true);
      setError(null);

      try {
        const [playerRes, careerRes] = await Promise.all([
          fetch(`/api/v1/players/${playerId}`),
          fetch(`/api/v1/players/${playerId}/career`),
        ]);

        if (!playerRes.ok) {
          throw new Error(`Player #${playerId} not found`);
        }

        const playerData = await playerRes.json();
        const careerData = careerRes.ok ? await careerRes.json() : { data: [] };

        setPlayer(playerData.data);
        setCareerStats(
          careerData.data || playerData.data.player_career_stats || []
        );
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to load player data";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    loadPlayerData();
  }, [playerId]);

  useEffect(() => {
    if (isNaN(playerId)) return;

    async function loadWagonWheel() {
      try {
        let url = `/api/v1/players/${playerId}/wagon-wheel`;
        const queryParams = new URLSearchParams();
        if (matchFilter !== "all") queryParams.append("match_id", matchFilter);
        if (zoneFilter !== "all") queryParams.append("zone_id", zoneFilter);
        if (queryParams.toString()) url += `?${queryParams.toString()}`;

        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          setShots(json.data || []);
          if (json.meta?.zoneDistribution) {
            setZoneDistribution(json.meta.zoneDistribution);
          }
        }
      } catch (err) {
        console.error("Failed to load wagon wheel shots:", err);
      }
    }

    loadWagonWheel();
  }, [playerId, matchFilter, zoneFilter]);

  if (loading) {
    return (
      <main className="container mx-auto px-4 sm:px-6 py-8 space-y-6">
        <Skeleton className="h-32 w-full rounded-none" />
        <Skeleton className="h-64 w-full rounded-none" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 w-full rounded-none" />
          <Skeleton className="h-96 w-full rounded-none" />
        </div>
      </main>
    );
  }

  if (error || !player) {
    return (
      <main className="container mx-auto px-4 sm:px-6 py-12">
        <Card className="max-w-md mx-auto border-destructive/50 bg-destructive/5">
          <CardContent className="p-8 text-center space-y-4">
            <IconAlertTriangle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-lg font-bold">Player Not Found</h2>
            <p className="text-xs text-muted-foreground">
              {error || "The requested player record could not be loaded."}
            </p>
            <Link href="/players">
              <Button size="sm" variant="outline" className="gap-2">
                <IconArrowLeft className="h-4 w-4" />
                Back to Player Directory
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/players">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-xs font-mono text-muted-foreground hover:text-foreground"
          >
            <IconArrowLeft className="h-4 w-4" />
            Player Directory
          </Button>
        </Link>
        <span className="text-xs font-mono text-muted-foreground">
          Player Profile #
          {String((player as Record<string, unknown>).player_id)}
        </span>
      </div>

      <PlayerHeader
        player={
          player as unknown as React.ComponentProps<
            typeof PlayerHeader
          >["player"]
        }
      />

      <PlayerCareerTable
        careerStats={
          careerStats as unknown as React.ComponentProps<
            typeof PlayerCareerTable
          >["careerStats"]
        }
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-heading font-extrabold tracking-tight flex items-center gap-2">
            <IconUser className="h-5 w-5 text-primary" />
            2D Spatial Shot Analysis & Ground Breakdown
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7 h-full flex flex-col">
            <WagonWheel
              shots={shots}
              playerId={playerId}
              playerName={(player as Record<string, unknown>).title as string}
              selectedMatchId={matchFilter}
              selectedZoneId={zoneFilter}
              onFilterMatchChange={setMatchFilter}
              onFilterZoneChange={setZoneFilter}
            />
          </div>

          <div className="lg:col-span-5 h-full flex flex-col">
            <ZoneRadarChart
              zoneData={
                zoneDistribution as unknown as React.ComponentProps<
                  typeof ZoneRadarChart
                >["zoneData"]
              }
            />
          </div>
        </div>
      </section>
    </main>
  );
}
