"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  IconUser,
  IconCricket,
  IconSearch,
  IconTarget,
  IconShield,
  IconAward,
} from "@tabler/icons-react";
import { formatPlayingRole } from "@/lib/utils";

interface SquadInfo {
  team_id: number;
  season?: string;
  teams: {
    team_id: number;
    title: string;
    abbr: string;
    logo_url: string | null;
  };
}

interface PlayerHeaderProps {
  player: {
    player_id: number;
    title: string;
    short_name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    playing_role?: string | null;
    batting_style?: string | null;
    bowling_style?: string | null;
    nationality?: string | null;
    team_squads?: SquadInfo[];
  };
}

interface BasicPlayer {
  player_id: number;
  title: string;
  short_name?: string | null;
  playing_role?: string | null;
}

export function PlayerHeader({ player }: PlayerHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BasicPlayer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      const timer = setTimeout(() => {
        setSearchResults([]);
        setIsSearching(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/v1/players?search=${encodeURIComponent(searchQuery.trim())}&limit=8`
        );
        if (res.ok) {
          const json = await res.json();
          setSearchResults(json.data || []);
        }
      } catch (err) {
        console.error("Failed to search players:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const currentTeam = player.team_squads?.[0]?.teams;

  return (
    <Card className="relative z-20 overflow-visible border-border/80 bg-linear-to-br from-card via-card/95 to-muted/30 shadow-md">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary/20 via-primary/10 to-primary/30 border border-primary/20 shadow-inner text-primary">
              <IconUser className="h-10 w-10" />
              {currentTeam?.logo_url && (
                <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full border-2 border-background bg-background p-0.5 shadow-md flex items-center justify-center overflow-hidden">
                  <Image
                    src={currentTeam.logo_url}
                    alt={currentTeam.title}
                    width={24}
                    height={24}
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {player.title}
                </h1>
                {player.short_name && player.short_name !== player.title && (
                  <Badge variant="outline" className="font-mono text-xs">
                    {player.short_name}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {currentTeam && (
                  <Badge className="bg-primary/15 text-primary hover:bg-primary/20 border-primary/30 gap-1">
                    <IconShield className="h-3.5 w-3.5" />
                    {currentTeam.title} ({currentTeam.abbr})
                  </Badge>
                )}
                {player.playing_role && (
                  <Badge variant="secondary" className="gap-1">
                    <IconCricket className="h-3.5 w-3.5" />
                    {formatPlayingRole(player.playing_role)}
                  </Badge>
                )}
                {player.nationality && (
                  <Badge variant="outline" className="gap-1">
                    <IconAward className="h-3.5 w-3.5" />
                    {player.nationality}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-0.5">
                {player.batting_style && (
                  <div className="flex items-center gap-1">
                    <IconTarget className="h-3.5 w-3.5 text-primary" />
                    <span>
                      Batting:{" "}
                      <strong className="text-foreground capitalize">
                        {player.batting_style}
                      </strong>
                    </span>
                  </div>
                )}
                {player.bowling_style && (
                  <div className="flex items-center gap-1">
                    <IconCricket className="h-3.5 w-3.5 text-primary" />
                    <span>
                      Bowling:{" "}
                      <strong className="text-foreground capitalize">
                        {player.bowling_style}
                      </strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="relative min-w-xs sm:min-w-sm">
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Search & Switch Player
            </label>
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Type player name (e.g. Dhoni, Kohli)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className="w-full pl-9 pr-4 py-2 rounded-none border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            {showDropdown && searchQuery.trim().length >= 2 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-30 max-h-60 overflow-y-auto rounded-none border border-border bg-popover p-1 shadow-lg text-popover-foreground">
                {isSearching ? (
                  <div className="p-3 text-xs text-center text-muted-foreground">
                    Searching players...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-3 text-xs text-center text-muted-foreground">
                    No players found matching &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  searchResults.map((p) => (
                    <button
                      key={p.player_id}
                      onClick={() => {
                        setShowDropdown(false);
                        setSearchQuery("");
                        router.push(`/players/${p.player_id}`);
                      }}
                      className="w-full text-left px-3 py-2 rounded-none text-xs hover:bg-accent hover:text-accent-foreground flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="font-medium text-foreground">
                        {p.title}
                      </span>
                      {p.playing_role && (
                        <span className="text-[11px] text-muted-foreground">
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
