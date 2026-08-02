import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

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

export async function GET() {
  try {
    const venueStats: VenueStatRow[] = await prisma.$queryRaw`
      SELECT 
        v.venue_id,
        v.name AS venue_name,
        v.location,
        v.country,
        COUNT(DISTINCT m.match_id)::int AS matches_played,
        ROUND(AVG(CASE WHEN mi.inning_number = 1 THEN mi.runs END), 1)::float AS avg_first_innings_score,
        ROUND(AVG(CASE WHEN mi.inning_number = 2 THEN mi.runs END), 1)::float AS avg_second_innings_score,
        COUNT(DISTINCT CASE WHEN m.toss_decision = 1 THEN m.match_id END)::int AS toss_elected_bat_count,
        COUNT(DISTINCT CASE WHEN m.toss_decision = 2 THEN m.match_id END)::int AS toss_elected_bowl_count
      FROM venues v
      LEFT JOIN matches m ON v.venue_id = m.venue_id
      LEFT JOIN match_innings mi ON m.match_id = mi.match_id
      GROUP BY v.venue_id, v.name, v.location, v.country
      ORDER BY matches_played DESC;
    `;

    return successResponse(venueStats);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return errorResponse(message, 500);
  }
}
