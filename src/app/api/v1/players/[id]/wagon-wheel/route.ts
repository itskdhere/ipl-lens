import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { successResponse, errorResponse } from "@/lib/api-response";
import { registry } from "@/lib/openapi";
import { z } from "zod";

export const WagonWheelParamsSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive()
    .openapi({ description: "Player ID", example: 52 }),
});

export const WagonWheelQuerySchema = z.object({
  match_id: z.coerce
    .number()
    .int()
    .optional()
    .openapi({ description: "Filter shots by match ID" }),
  zone_id: z.coerce
    .number()
    .int()
    .optional()
    .openapi({ description: "Filter shots by field zone ID" }),
});

registry.registerPath({
  method: "get",
  path: "/api/v1/players/{id}/wagon-wheel",
  summary: "2D spatial wagon wheel shot coordinates",
  request: {
    params: WagonWheelParamsSchema,
    query: WagonWheelQuerySchema,
  },
  responses: {
    200: {
      description: "Spatial shot coordinates (x,y) and zone distributions",
    },
    400: { description: "Invalid parameters" },
  },
});

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
    const rawParams = await params;
    const parsedParams = WagonWheelParamsSchema.safeParse(rawParams);

    if (!parsedParams.success) {
      return errorResponse("Invalid player_id parameter", 400);
    }

    const playerId = parsedParams.data.id;

    const rawQuery = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsedQuery = WagonWheelQuerySchema.safeParse(rawQuery);

    if (!parsedQuery.success) {
      return errorResponse(
        `Invalid query parameters: ${parsedQuery.error.issues.map((i) => i.message).join(", ")}`,
        400
      );
    }

    const { match_id: matchId, zone_id: zoneId } = parsedQuery.data;

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
