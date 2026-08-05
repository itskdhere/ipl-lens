"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  IconCricket,
  IconCalendar,
  IconMapPin,
  IconTrophy,
  IconChevronLeft,
  IconChevronRight,
  IconFilter,
  IconAlertCircle,
  IconSearch,
} from "@tabler/icons-react";
import { formatDate } from "@/lib/utils";

interface MatchItem {
  match_id: number;
  title: string;
  short_title: string;
  subtitle: string | null;
  match_number: string | null;
  status: string;
  status_note: string | null;
  date_start: string;
  date_start_ist: string | null;
  team_a: {
    team_id: number;
    title: string;
    abbr: string;
    logo_url: string | null;
  };
  team_b: {
    team_id: number;
    title: string;
    abbr: string;
    logo_url: string | null;
  };
  team_a_score: string | null;
  team_b_score: string | null;
  team_a_overs: string | null;
  team_b_overs: string | null;
  venue: { venue_id: number; name: string; location: string | null };
  result: string | null;
  win_margin: string | null;
  winning_team: { team_id: number; title: string; abbr: string } | null;
  man_of_the_match: {
    player_id: number;
    title: string;
    short_name: string | null;
  } | null;
  toss_text: string | null;
}

interface VenueOption {
  venue_id: number;
  venue_name: string;
}

export default function MatchExplorerPage() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMatches, setTotalMatches] = useState(0);
  const [teamFilter, setTeamFilter] = useState<string>("");
  const [venueFilter, setVenueFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [venuesList, setVenuesList] = useState<VenueOption[]>([]);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    fetch("/api/v1/venues")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setVenuesList(data.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadMatches() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", page.toString());
        params.set("limit", "10");
        if (teamFilter) params.set("team_id", teamFilter);
        if (venueFilter && venueFilter !== "all")
          params.set("venue_id", venueFilter);
        if (searchTerm.trim()) params.set("search", searchTerm.trim());

        const res = await fetch(`/api/v1/matches?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const json = await res.json();
        if (isMounted) {
          if (json.success) {
            setMatches(json.data || []);
            const meta = json.meta || json.pagination || {};
            setTotalPages(meta.totalPages || 1);
            setTotalMatches(meta.total || json.data?.length || 0);
            setError(null);
          } else {
            setError(json.error || "Failed to load matches");
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

    const timer = setTimeout(loadMatches, 300);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [page, teamFilter, venueFilter, searchTerm, reloadToken]);

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="border-b border-border pb-6 space-y-3">
        <h1 className="font-heading text-3xl font-extrabold flex items-center gap-2.5">
          <IconCricket className="h-8 w-8 text-primary" />
          Match Explorer
        </h1>
        <p className="text-sm text-muted-foreground">
          Browse all 74 IPL 2022 Fixtures, full match scorecards, worm
          progression, and phase breakdowns.
        </p>
      </div>

      <Card className="border-border/80 p-4 bg-muted/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-72">
              <IconSearch className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search team or stadium..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
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
                value={venueFilter}
                items={[
                  { value: "all", label: "All Venues" },
                  ...venuesList.map((v) => ({
                    value: v.venue_id.toString(),
                    label: v.venue_name,
                  })),
                ]}
                onValueChange={(val) => {
                  setLoading(true);
                  setVenueFilter(val || "all");
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-auto max-w-full">
                  <SelectValue placeholder="All Venues" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Venues</SelectItem>
                  {venuesList.map((v) => (
                    <SelectItem
                      key={`venue-${v.venue_id}`}
                      value={v.venue_id.toString()}
                    >
                      {v.venue_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(teamFilter ||
                (venueFilter && venueFilter !== "all") ||
                searchTerm) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLoading(true);
                    setTeamFilter("");
                    setVenueFilter("all");
                    setSearchTerm("");
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
            Total Matches: {totalMatches}
          </Badge>
        </div>
      </Card>

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between py-4 border-b border-border">
          <p className="text-xs text-muted-foreground font-mono">
            Page {page} of {totalPages} (Showing {matches.length} of{" "}
            {totalMatches} Matches)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => {
                setLoading(true);
                setPage((p) => Math.max(1, p - 1));
              }}
              className="gap-1 text-xs"
            >
              <IconChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => {
                setLoading(true);
                setPage((p) => Math.min(totalPages, p + 1));
              }}
              className="gap-1 text-xs"
            >
              Next
              <IconChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-none" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-none text-center">
          <IconAlertCircle className="h-10 w-10 text-destructive mb-3" />
          <p className="text-base font-semibold text-destructive">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              setLoading(true);
              setReloadToken((t) => t + 1);
            }}
          >
            Retry Loading Matches
          </Button>
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-none text-muted-foreground">
          No matches found matching your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map((m, idx) => {
            const isCompleted =
              m.status.toLowerCase().includes("completed") || m.result;

            return (
              <Link
                key={`match-${m.match_id}-${idx}`}
                href={`/matches/${m.match_id}`}
                className="group"
              >
                <Card className="h-full border-border/80 hover:border-primary/50 transition-all hover:shadow-md bg-card hover:bg-muted">
                  <CardHeader className="pb-3 pt-4 px-5 flex flex-row items-center justify-between border-b border-border/40">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="font-mono text-[11px]"
                      >
                        Match {m.match_number || `#${m.match_id}`}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                        <IconCalendar className="h-3.5 w-3.5" />
                        {formatDate(m.date_start_ist || m.date_start)}
                      </span>
                    </div>

                    <Badge
                      variant={isCompleted ? "success" : "outline"}
                      className="text-[10px]"
                    >
                      {m.status}
                    </Badge>
                  </CardHeader>

                  <CardContent className="p-5 space-y-4">
                    <div className="grid grid-cols-12 items-center gap-2">
                      <div className="col-span-5 flex items-center gap-3">
                        {m.team_a?.logo_url ? (
                          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border p-0.5 bg-background">
                            <Image
                              src={m.team_a.logo_url}
                              alt={m.team_a.title}
                              fill
                              sizes="32px"
                              className="object-contain"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-xs">
                            {m.team_a?.abbr || "A"}
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                            {m.team_a?.title}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {m.team_a_score || "N/A"}{" "}
                            {m.team_a_overs ? `(${m.team_a_overs} ov)` : ""}
                          </span>
                        </div>
                      </div>

                      <div className="col-span-2 text-center">
                        <span className="text-xs font-bold font-mono text-muted-foreground/60 bg-muted px-2 py-0.5 rounded-none">
                          VS
                        </span>
                      </div>

                      <div className="col-span-5 flex items-center justify-end gap-3 text-right">
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                            {m.team_b?.title}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {m.team_b_score || "N/A"}{" "}
                            {m.team_b_overs ? `(${m.team_b_overs} ov)` : ""}
                          </span>
                        </div>
                        {m.team_b?.logo_url ? (
                          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border p-0.5 bg-background">
                            <Image
                              src={m.team_b.logo_url}
                              alt={m.team_b.title}
                              fill
                              sizes="32px"
                              className="object-contain"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-xs">
                            {m.team_b?.abbr || "B"}
                          </div>
                        )}
                      </div>
                    </div>

                    {m.status_note && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-3 py-1.5 rounded-none">
                        <IconTrophy className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{m.status_note}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                      <span className="flex items-center gap-1 truncate">
                        <IconMapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        {m.venue?.name}
                      </span>
                      {m.man_of_the_match && (
                        <span className="font-mono text-[11px] shrink-0">
                          MOTM: {m.man_of_the_match.title}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between py-4 border-t border-border">
          <p className="text-xs text-muted-foreground font-mono">
            Page {page} of {totalPages} (Showing {matches.length} of{" "}
            {totalMatches} Matches)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => {
                setLoading(true);
                setPage((p) => Math.max(1, p - 1));
              }}
              className="gap-1 text-xs"
            >
              <IconChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => {
                setLoading(true);
                setPage((p) => Math.min(totalPages, p + 1));
              }}
              className="gap-1 text-xs"
            >
              Next
              <IconChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
