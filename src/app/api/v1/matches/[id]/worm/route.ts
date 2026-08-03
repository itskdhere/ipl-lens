import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { registry } from "@/lib/openapi";
import { z } from "zod";

export const MatchWormParamsSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive()
    .openapi({ description: "Match ID", example: 105 }),
});

registry.registerPath({
  method: "get",
  path: "/api/v1/matches/{id}/worm",
  summary: "Over-by-over worm chart data",
  request: {
    params: MatchWormParamsSchema,
  },
  responses: {
    200: { description: "Over-by-over cumulative runs and wickets" },
    400: { description: "Invalid match_id parameter" },
  },
});

interface WormRow {
  inning_id: number;
  inning_number: number;
  team_name: string;
  over_number: number;
  runs_in_over: number;
  cumulative_runs: number;
  wickets_in_over: number;
  cumulative_wickets: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rawParams = await params;
    const parsed = MatchWormParamsSchema.safeParse(rawParams);

    if (!parsed.success) {
      return errorResponse("Invalid match_id parameter", 400);
    }

    const matchId = parsed.data.id;

    const overProgression: WormRow[] = await prisma.$queryRaw`
      SELECT 
        bc.inning_id,
        mi.inning_number,
        mi.short_name AS team_name,
        bc.over_number,
        SUM(bc.total_runs)::int AS runs_in_over,
        SUM(SUM(bc.total_runs)) OVER (
          PARTITION BY bc.inning_id 
          ORDER BY bc.over_number
        )::int AS cumulative_runs,
        COUNT(CASE WHEN bc.is_wicket = true THEN 1 END)::int AS wickets_in_over,
        SUM(COUNT(CASE WHEN bc.is_wicket = true THEN 1 END)) OVER (
          PARTITION BY bc.inning_id 
          ORDER BY bc.over_number
        )::int AS cumulative_wickets
      FROM ball_commentary bc
      JOIN match_innings mi ON bc.inning_id = mi.inning_id
      WHERE (bc.match_id = ${matchId} OR mi.match_id = ${matchId})
      GROUP BY bc.inning_id, mi.inning_number, mi.short_name, bc.over_number
      ORDER BY mi.inning_number ASC, bc.over_number ASC;
    `;

    return successResponse(overProgression);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return errorResponse(message, 500);
  }
}
