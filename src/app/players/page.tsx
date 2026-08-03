"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconSearch,
  IconUser,
  IconCricket,
  IconChevronLeft,
  IconChevronRight,
  IconFilter,
  IconUsers,
} from "@tabler/icons-react";
import { formatPlayingRole } from "@/lib/utils";

interface PlayerItem {
  player_id: number;
  title: string;
  short_name?: string | null;
  playing_role?: string | null;
  batting_style?: string | null;
  bowling_style?: string | null;
  nationality?: string | null;
  team_squads?: Array<{
    teams: {
      team_id: number;
      title: string;
      abbr: string;
      logo_url: string | null;
    };
  }>;
}

export default function PlayersDirectoryPage() {
  const [players, setPlayers] = useState<PlayerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPlayers, setTotalPlayers] = useState(0);

  useEffect(() => {
    async function fetchPlayers() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append("page", page.toString());
        queryParams.append("limit", "18");
        if (search.trim()) queryParams.append("search", search.trim());
        if (role !== "all") queryParams.append("role", role);

        const res = await fetch(`/api/v1/players?${queryParams.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setPlayers(json.data || []);
          if (json.meta) {
            setTotalPages(json.meta.totalPages || 1);
            setTotalPlayers(json.meta.total || 0);
          }
        }
      } catch (err) {
        console.error("Failed to fetch players list:", err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(fetchPlayers, 200);
    return () => clearTimeout(timer);
  }, [search, role, page]);

  return (
    <main className="container mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="border-b border-border pb-6 space-y-3">
        <h1 className="font-heading text-3xl font-extrabold flex items-center gap-2.5">
          <IconUsers className="h-8 w-8 text-primary" />
          Player Directory & Career
        </h1>
        <p className="text-sm text-muted-foreground">
          Search across players to view individual profiles, multi-format
          statistics, 8-zone scoring radar maps, and spatial 2D wagon wheel shot
          distributions.
        </p>
      </div>

      <Card className="border-border/80 p-4 bg-muted/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-72">
              <IconSearch className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search player name (e.g. Dhoni, Bumrah)..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium shrink-0">
                <IconFilter className="h-4 w-4" />
                <span>Filters:</span>
              </div>

              <Select
                value={role}
                items={[
                  { value: "all", label: "All Playing Roles" },
                  { value: "batsman", label: "Batsmen" },
                  { value: "bowler", label: "Bowlers" },
                  { value: "allrounder", label: "All-rounders" },
                  { value: "keeper", label: "Wicketkeepers" },
                ]}
                onValueChange={(val) => {
                  if (val) setRole(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-auto max-w-full">
                  <SelectValue placeholder="All Playing Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Playing Roles</SelectItem>
                  <SelectItem value="batsman">Batsmen</SelectItem>
                  <SelectItem value="bowler">Bowlers</SelectItem>
                  <SelectItem value="allrounder">All-rounders</SelectItem>
                  <SelectItem value="keeper">Wicketkeepers</SelectItem>
                </SelectContent>
              </Select>

              {(search || (role && role !== "all")) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setRole("all");
                    setPage(1);
                  }}
                  className="text-xs text-muted-foreground"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          <Badge
            variant="outline"
            className="font-mono text-xs px-3 py-1 shrink-0 self-start md:self-center"
          >
            Total Players: {totalPlayers}
          </Badge>
        </div>
      </Card>

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between py-4 border-b border-border">
          <span className="text-xs font-mono text-muted-foreground">
            Page {page} of {totalPages} (Showing {players.length} of{" "}
            {totalPlayers} Players)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="gap-1 text-xs"
            >
              <IconChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="gap-1 text-xs"
            >
              Next <IconChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-none" />
          ))}
        </div>
      ) : players.length === 0 ? (
        <div className="p-12 text-center border border-dashed rounded-none space-y-3">
          <IconCricket className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold">No Players Found</h3>
          <p className="text-xs text-muted-foreground">
            Try adjusting your search filter or clear keywords.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSearch("");
              setRole("all");
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {players.map((p) => {
            const team = p.team_squads?.[0]?.teams;
            return (
              <Link key={p.player_id} href={`/players/${p.player_id}`}>
                <Card className="h-full border-border/80 hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer">
                  <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-muted group-hover:bg-primary/10 text-primary transition-colors">
                      <IconUser className="h-7 w-7" />
                      {team?.logo_url && (
                        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-background border p-0.5 shadow-xs flex items-center justify-center">
                          <Image
                            src={team.logo_url}
                            alt={team.title}
                            width={18}
                            height={18}
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 w-full">
                      <h3 className="font-heading font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {p.title}
                      </h3>
                      {team && (
                        <p className="text-[11px] font-mono text-muted-foreground truncate">
                          {team.title}
                        </p>
                      )}
                    </div>

                    {p.playing_role && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-2 py-0.5"
                      >
                        {formatPlayingRole(p.playing_role)}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between py-4 border-t border-border">
          <span className="text-xs font-mono text-muted-foreground">
            Page {page} of {totalPages} (Showing {players.length} of{" "}
            {totalPlayers} Players)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="gap-1 text-xs"
            >
              <IconChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="gap-1 text-xs"
            >
              Next <IconChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
