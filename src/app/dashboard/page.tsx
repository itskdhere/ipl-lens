import { Badge } from "@/components/ui/badge";
import { Leaderboards } from "./_components/leaderboards";
import { StandingsTable } from "./_components/standings-table";
import { TossVenueAnalytics } from "./_components/toss-venue-analytics";
import {
  IconLayoutDashboard,
  IconCricket,
  IconChartDots,
  IconUsers,
  IconBuildingStadium,
} from "@tabler/icons-react";

export default function DashboardPage() {
  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="border-b border-border pb-6 space-y-3">
        <h1 className="font-heading text-3xl font-extrabold flex items-center gap-2.5">
          <IconLayoutDashboard className="h-8 w-8 text-primary" />
          Dashboard & Tournament Insights
        </h1>
        <p className="text-sm text-muted-foreground">
          Explore standings, leaderboards, ball-by-ball scorecards, phase
          progression worm charts, and venue analytics.
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Badge
            variant="outline"
            className="font-mono text-xs px-3 py-1 flex items-center gap-1.5"
          >
            <IconCricket className="h-3.5 w-3.5 text-amber-500" />
            <span>74 Matches</span>
          </Badge>
          <Badge
            variant="outline"
            className="font-mono text-xs px-3 py-1 flex items-center gap-1.5"
          >
            <IconUsers className="h-3.5 w-3.5 text-sky-500" />
            <span>10 Teams</span>
          </Badge>
          <Badge
            variant="outline"
            className="font-mono text-xs px-3 py-1 flex items-center gap-1.5"
          >
            <IconBuildingStadium className="h-3.5 w-3.5 text-emerald-500" />
            <span>6 Venues</span>
          </Badge>
          <Badge
            variant="outline"
            className="font-mono text-xs px-3 py-1 flex items-center gap-1.5"
          >
            <IconChartDots className="h-3.5 w-3.5 text-purple-500" />
            <span>18,000+ Balls</span>
          </Badge>
        </div>
      </div>

      <section className="space-y-8">
        <StandingsTable />
        <Leaderboards />
      </section>

      <section>
        <TossVenueAnalytics />
      </section>
    </main>
  );
}
