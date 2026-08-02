import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { successResponse, errorResponse } from "@/lib/api-response";

interface ZoneDistributionRow {
  zone_id: number;
  zone_name: string | null;
  shot_count: number;
  runs_scored: number;
  fours: number;
  sixes: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const playerId = parseInt(id);

    if (isNaN(playerId)) {
      return errorResponse("Invalid player_id parameter", 400);
    }

    const searchParams = request.nextUrl.searchParams;
    const matchId = searchParams.get("match_id")
      ? parseInt(searchParams.get("match_id")!)
      : undefined;
    const zoneId = searchParams.get("zone_id")
      ? parseInt(searchParams.get("zone_id")!)
      : undefined;

    const where: Prisma.wagon_wheel_shotsWhereInput = { batsman_id: playerId };
    if (matchId) where.match_id = matchId;
    if (zoneId) where.zone_id = zoneId;

    const shots = await prisma.wagon_wheel_shots.findMany({
      where,
      orderBy: { over_number: "asc" },
      select: {
        shot_id: true,
        match_id: true,
        inning_id: true,
        batsman_id: true,
        bowler_id: true,
        over_number: true,
        unique_over: true,
        bat_runs: true,
        team_runs: true,
        coord_x: true,
        coord_y: true,
        zone_id: true,
        zone_name: true,
        event_name: true,
      },
    });

    const zoneDistribution: ZoneDistributionRow[] = await prisma.$queryRaw`
      SELECT 
        zone_id,
        zone_name,
        COUNT(*)::int AS shot_count,
        SUM(bat_runs)::int AS runs_scored,
        COUNT(CASE WHEN bat_runs = 4 THEN 1 END)::int AS fours,
        COUNT(CASE WHEN bat_runs = 6 THEN 1 END)::int AS sixes
      FROM wagon_wheel_shots
      WHERE batsman_id = ${playerId}
        ${matchId ? prisma.$queryRaw`AND match_id = ${matchId}` : prisma.$queryRaw``}
      GROUP BY zone_id, zone_name
      ORDER BY zone_id ASC;
    `;

    return successResponse(shots, { zoneDistribution });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return errorResponse(message, 500);
  }
}
