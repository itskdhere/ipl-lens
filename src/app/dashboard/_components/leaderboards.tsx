"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  IconFlame,
  IconTarget,
  IconBolt,
  IconMedal,
  IconAlertCircle,
} from "@tabler/icons-react";

interface OrangeCapRow {
  player_id: number;
  player_name: string;
  short_name: string | null;
  logo_url: string | null;
  thumb_url: string | null;
  matches: number;
  total_runs: number;
  balls_faced: number;
  fours: number;
  sixes: number;
  highest_score: number;
  strike_rate: number;
}

interface PurpleCapRow {
  player_id: number;
  player_name: string;
  short_name: string | null;
  logo_url: string | null;
  thumb_url: string | null;
  matches: number;
  total_wickets: number;
  total_overs: number;
  runs_conceded: number;
  dot_balls: number;
  economy: number;
}

interface BoundaryKingsRow {
  player_id: number;
  player_name: string;
  short_name: string | null;
  logo_url: string | null;
  thumb_url: string | null;
  total_sixes: number;
  total_fours: number;
  total_runs: number;
}

export function Leaderboards() {
  const [activeTab, setActiveTab] = useState<"runs" | "wickets" | "sixes">(
    "runs"
  );
  const [orangeCap, setOrangeCap] = useState<OrangeCapRow[]>([]);
  const [purpleCap, setPurpleCap] = useState<PurpleCapRow[]>([]);
  const [boundaryKings, setBoundaryKings] = useState<BoundaryKingsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const type = activeTab;

    async function loadData() {
      try {
        const res = await fetch(`/api/v1/leaderboards?type=${type}&limit=5`);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const json = await res.json();
        if (isMounted) {
          if (json.success) {
            if (type === "runs") setOrangeCap(json.data);
            if (type === "wickets") setPurpleCap(json.data);
            if (type === "sixes") setBoundaryKings(json.data);
            setError(null);
          } else {
            setError(json.error || "Failed to fetch leaderboards");
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

    loadData();
    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  return (
    <Card className="h-full border-border/80 shadow-sm flex flex-col">
      <CardHeader className="pb-3 space-y-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-xl font-heading font-bold">
            <IconMedal className="h-5 w-5 text-amber-500" />
            Tournament Leaderboards
          </CardTitle>
          <CardDescription>
            Season performance awards (Orange Cap, Purple Cap, Boundary Kings)
          </CardDescription>
        </div>
        <Tabs
          defaultValue="runs"
          value={activeTab}
          onValueChange={(val) => {
            setLoading(true);
            setActiveTab(val as "runs" | "wickets" | "sixes");
          }}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="runs" className="gap-1 text-xs">
              <IconFlame className="h-3.5 w-3.5 text-amber-500" />
              Orange
            </TabsTrigger>
            <TabsTrigger value="wickets" className="gap-1 text-xs">
              <IconTarget className="h-3.5 w-3.5 text-purple-500" />
              Purple
            </TabsTrigger>
            <TabsTrigger value="sixes" className="gap-1 text-xs">
              <IconBolt className="h-3.5 w-3.5 text-sky-500" />
              Sixes
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col justify-between gap-2.5">
            {[...Array(5)].map((_, i) => (
              <Skeleton
                key={i}
                className="flex-1 min-h-13 w-full rounded-none"
              />
            ))}
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 border border-dashed rounded-none">
            <IconAlertCircle className="h-7 w-7 text-destructive mb-2" />
            <p className="text-xs font-medium text-destructive">{error}</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between">
            {activeTab === "runs" && (
              <div className="flex-1 flex flex-col justify-between gap-2.5">
                {orangeCap.map((player, idx) => (
                  <Link
                    key={`orange-${player.player_id}-${idx}`}
                    href={`/players/${player.player_id}`}
                    className="flex-1 flex items-center justify-between p-3.5 rounded-none border border-border/50 bg-card hover:bg-muted transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-none text-xs font-bold ${
                          idx === 0
                            ? "bg-amber-500 text-amber-950"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm group-hover:text-primary transition-colors">
                          {player.player_name}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {player.matches} Matches • SR: {player.strike_rate}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-mono font-extrabold text-base text-amber-500">
                        {player.total_runs}{" "}
                        <span className="text-xs font-normal">runs</span>
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        HS: {player.highest_score} | 6s: {player.sixes}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {activeTab === "wickets" && (
              <div className="flex-1 flex flex-col justify-between gap-2.5">
                {purpleCap.map((player, idx) => (
                  <Link
                    key={`purple-${player.player_id}-${idx}`}
                    href={`/players/${player.player_id}`}
                    className="flex-1 flex items-center justify-between p-3.5 rounded-none border border-border/50 bg-card hover:bg-muted transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-none text-xs font-bold ${
                          idx === 0
                            ? "bg-purple-600 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm group-hover:text-primary transition-colors">
                          {player.player_name}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {player.matches} Matches • Econ: {player.economy}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-mono font-extrabold text-base text-purple-500">
                        {player.total_wickets}{" "}
                        <span className="text-xs font-normal">wkt</span>
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        Overs: {player.total_overs} | Dots: {player.dot_balls}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {activeTab === "sixes" && (
              <div className="flex-1 flex flex-col justify-between gap-2.5">
                {boundaryKings.map((player, idx) => (
                  <Link
                    key={`sixes-${player.player_id}-${idx}`}
                    href={`/players/${player.player_id}`}
                    className="flex-1 flex items-center justify-between p-3.5 rounded-none border border-border/50 bg-card hover:bg-muted transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-none text-xs font-bold ${
                          idx === 0
                            ? "bg-sky-500 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm group-hover:text-primary transition-colors">
                          {player.player_name}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          Total Runs: {player.total_runs}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="secondary"
                          className="font-mono text-xs text-sky-500"
                        >
                          {player.total_sixes} 6s
                        </Badge>
                        <Badge variant="outline" className="font-mono text-xs">
                          {player.total_fours} 4s
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
