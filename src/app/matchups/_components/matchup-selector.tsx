"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  IconSwords,
  IconSearch,
  IconCricket,
  IconSparkles,
  IconLoader2,
  IconX,
} from "@tabler/icons-react";
import { formatPlayingRole } from "@/lib/utils";

export interface PlayerOption {
  player_id: number;
  title: string;
  short_name?: string | null;
  playing_role?: string | null;
}

interface MatchupSelectorProps {
  selectedBatsmanId: number;
  selectedBowlerId: number;
  onSelectBatsman: (id: number) => void;
  onSelectBowler: (id: number) => void;
}

interface PresetPair {
  name: string;
  batsmanId: number;
  bowlerId: number;
}

export function MatchupSelector({
  selectedBatsmanId,
  selectedBowlerId,
  onSelectBatsman,
  onSelectBowler,
}: MatchupSelectorProps) {
  const [batsmanQuery, setBatsmanQuery] = useState("");
  const [bowlerQuery, setBowlerQuery] = useState("");

  const [batsmanResults, setBatsmanResults] = useState<PlayerOption[]>([]);
  const [bowlerResults, setBowlerResults] = useState<PlayerOption[]>([]);

  const [loadingBatsman, setLoadingBatsman] = useState(false);
  const [loadingBowler, setLoadingBowler] = useState(false);

  const [batsmanDropdown, setBatsmanDropdown] = useState(false);
  const [bowlerDropdown, setBowlerDropdown] = useState(false);

  const [selectedBatsman, setSelectedBatsman] = useState<PlayerOption | null>(
    null
  );
  const [selectedBowler, setSelectedBowler] = useState<PlayerOption | null>(
    null
  );

  const [dynamicPresets, setDynamicPresets] = useState<PresetPair[]>([]);
  const [loadingPresets, setLoadingPresets] = useState<boolean>(true);

  const batsmanRef = useRef<HTMLDivElement>(null);
  const bowlerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        batsmanRef.current &&
        !batsmanRef.current.contains(event.target as Node)
      ) {
        setBatsmanDropdown(false);
      }
      if (
        bowlerRef.current &&
        !bowlerRef.current.contains(event.target as Node)
      ) {
        setBowlerDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function loadPresets() {
      setLoadingPresets(true);
      try {
        const res = await fetch("/api/v1/analytics/matchups/top?limit=5");
        if (res.ok) {
          const json = await res.json();
          const items = json.data || [];
          const presets: PresetPair[] = items.map(
            (r: {
              batsman_short_name?: string | null;
              batsman_name: string;
              bowler_short_name?: string | null;
              bowler_name: string;
              batsman_id: number;
              bowler_id: number;
            }) => ({
              name: `${r.batsman_short_name || r.batsman_name} vs ${r.bowler_short_name || r.bowler_name}`,
              batsmanId: r.batsman_id,
              bowlerId: r.bowler_id,
            })
          );
          if (presets.length) setDynamicPresets(presets);
        }
      } catch (err) {
        console.error("Failed to load preset rivalries:", err);
      } finally {
        setLoadingPresets(false);
      }
    }
    loadPresets();
  }, []);

  if (!selectedBatsmanId && selectedBatsman !== null) {
    setSelectedBatsman(null);
  }

  if (!selectedBowlerId && selectedBowler !== null) {
    setSelectedBowler(null);
  }

  useEffect(() => {
    let ignore = false;

    async function fetchPlayerDetails(id: number, type: "batsman" | "bowler") {
      if (!id) return;
      try {
        const res = await fetch(`/api/v1/players/${id}`);
        if (res.ok && !ignore) {
          const json = await res.json();
          if (type === "batsman") setSelectedBatsman(json.data);
          else setSelectedBowler(json.data);
        }
      } catch (err) {
        console.error("Failed to load player detail:", err);
      }
    }

    if (selectedBatsmanId) fetchPlayerDetails(selectedBatsmanId, "batsman");
    if (selectedBowlerId) fetchPlayerDetails(selectedBowlerId, "bowler");

    return () => {
      ignore = true;
    };
  }, [selectedBatsmanId, selectedBowlerId]);

  useEffect(() => {
    if (batsmanQuery.trim().length < 2) {
      const timer = setTimeout(() => {
        setBatsmanResults([]);
        setLoadingBatsman(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(async () => {
      setLoadingBatsman(true);
      try {
        const res = await fetch(
          `/api/v1/players?search=${encodeURIComponent(batsmanQuery.trim())}&limit=8`
        );
        if (res.ok) {
          const json = await res.json();
          setBatsmanResults(json.data || []);
        }
      } catch (err) {
        console.error("Error searching batsman:", err);
      } finally {
        setLoadingBatsman(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [batsmanQuery]);

  useEffect(() => {
    if (bowlerQuery.trim().length < 2) {
      const timer = setTimeout(() => {
        setBowlerResults([]);
        setLoadingBowler(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(async () => {
      setLoadingBowler(true);
      try {
        const res = await fetch(
          `/api/v1/players?search=${encodeURIComponent(bowlerQuery.trim())}&limit=8`
        );
        if (res.ok) {
          const json = await res.json();
          setBowlerResults(json.data || []);
        }
      } catch (err) {
        console.error("Error searching bowler:", err);
      } finally {
        setLoadingBowler(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [bowlerQuery]);

  return (
    <Card className="relative z-20 overflow-visible border-border/80 shadow-md bg-linear-to-br from-card via-card/95 to-muted/30">
      <CardContent className="p-6 space-y-6">
        <div className="flex flex-col items-start gap-3 border-b border-border/60 pb-4">
          <div>
            <h2 className="text-xl font-heading font-extrabold flex items-center gap-2">
              <IconSwords className="h-6 w-6 text-primary" />
              Select H2H Matchup Pair
            </h2>
            <p className="text-xs text-muted-foreground">
              Compare historical performance metrics between any Batter and
              Bowler
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
              <IconSparkles className="h-3.5 w-3.5 text-amber-500" />
              Top Rivalries:
            </span>
            {loadingPresets
              ? Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-7 w-28 rounded-none" />
                ))
              : dynamicPresets.map((r, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onSelectBatsman(r.batsmanId);
                      onSelectBowler(r.bowlerId);
                      setBatsmanQuery("");
                      setBowlerQuery("");
                      setBatsmanDropdown(false);
                      setBowlerDropdown(false);
                    }}
                    className="h-7 text-[11px] font-mono px-2.5 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                  >
                    {r.name}
                  </Button>
                ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          <div ref={batsmanRef} className="md:col-span-5 relative space-y-1.5">
            <label className="text-xs font-bold font-mono text-foreground uppercase flex items-center gap-1.5">
              <IconCricket className="h-4 w-4 text-emerald-500" />
              Batsman
            </label>

            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Type batsman name..."
                value={
                  batsmanQuery !== ""
                    ? batsmanQuery
                    : selectedBatsman
                      ? selectedBatsman.title
                      : ""
                }
                onChange={(e) => {
                  setBatsmanQuery(e.target.value);
                  setBatsmanDropdown(true);
                }}
                onFocus={(e) => {
                  setBatsmanDropdown(true);
                  e.target.select();
                }}
                className="w-full pl-9 pr-9 py-2.5 rounded-none border border-input bg-background text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              {loadingBatsman ? (
                <IconLoader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
              ) : batsmanQuery || selectedBatsman ? (
                <button
                  type="button"
                  onClick={() => {
                    onSelectBatsman(0);
                    setSelectedBatsman(null);
                    setBatsmanQuery("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center"
                  title="Clear selection"
                >
                  <IconX className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            {batsmanDropdown && batsmanQuery.trim().length >= 2 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-60 overflow-y-auto rounded-none border border-border bg-popover p-1 shadow-lg text-popover-foreground">
                {loadingBatsman ? (
                  <div className="p-3 text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
                    <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                    Searching batsmen...
                  </div>
                ) : batsmanResults.length === 0 ? (
                  <div className="p-3 text-xs text-muted-foreground text-center">
                    No batsmen found matching &quot;{batsmanQuery}&quot;
                  </div>
                ) : (
                  batsmanResults.map((p) => (
                    <button
                      key={p.player_id}
                      onClick={() => {
                        onSelectBatsman(p.player_id);
                        setSelectedBatsman(p);
                        setBatsmanQuery("");
                        setBatsmanDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs rounded-none hover:bg-accent flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <span className="font-semibold text-foreground">
                        {p.title}
                      </span>
                      {p.playing_role && (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {formatPlayingRole(p.playing_role)}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="md:col-span-1 flex items-center justify-center pt-2 md:pt-6">
            <div className="h-10 w-10 rounded-none bg-primary text-primary-foreground font-heading font-black text-sm flex items-center justify-center shadow-lg border-2 border-background">
              VS
            </div>
          </div>

          <div ref={bowlerRef} className="md:col-span-5 relative space-y-1.5">
            <label className="text-xs font-bold font-mono text-foreground uppercase flex items-center gap-1.5">
              <IconCricket className="h-4 w-4 text-sky-500" />
              Bowler
            </label>

            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Type bowler name..."
                value={
                  bowlerQuery !== ""
                    ? bowlerQuery
                    : selectedBowler
                      ? selectedBowler.title
                      : ""
                }
                onChange={(e) => {
                  setBowlerQuery(e.target.value);
                  setBowlerDropdown(true);
                }}
                onFocus={(e) => {
                  setBowlerDropdown(true);
                  e.target.select();
                }}
                className="w-full pl-9 pr-9 py-2.5 rounded-none border border-input bg-background text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              {loadingBowler ? (
                <IconLoader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
              ) : bowlerQuery || selectedBowler ? (
                <button
                  type="button"
                  onClick={() => {
                    onSelectBowler(0);
                    setSelectedBowler(null);
                    setBowlerQuery("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center"
                  title="Clear selection"
                >
                  <IconX className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            {bowlerDropdown && bowlerQuery.trim().length >= 2 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-60 overflow-y-auto rounded-none border border-border bg-popover p-1 shadow-lg text-popover-foreground">
                {loadingBowler ? (
                  <div className="p-3 text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
                    <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                    Searching bowlers...
                  </div>
                ) : bowlerResults.length === 0 ? (
                  <div className="p-3 text-xs text-muted-foreground text-center">
                    No bowlers found matching &quot;{bowlerQuery}&quot;
                  </div>
                ) : (
                  bowlerResults.map((p) => (
                    <button
                      key={p.player_id}
                      onClick={() => {
                        onSelectBowler(p.player_id);
                        setSelectedBowler(p);
                        setBowlerQuery("");
                        setBowlerDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs rounded-none hover:bg-accent flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <span className="font-semibold text-foreground">
                        {p.title}
                      </span>
                      {p.playing_role && (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {formatPlayingRole(p.playing_role)}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
