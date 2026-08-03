import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { registry } from "@/lib/openapi";
import { z } from "zod";

export const TopRivalriesQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(10)
    .optional()
    .default(4)
    .openapi({ description: "Number of top rivalries to return (default 4)" }),
});

registry.registerPath({
  method: "get",
  path: "/api/v1/analytics/matchups/top",
  summary: "Top Head-to-Head Batter vs Bowler rivalries by deliveries faced",
  request: {
    query: TopRivalriesQuerySchema,
  },
  responses: {
    200: { description: "List of top H2H rivalries" },
  },
});

interface RivalryRow {
  batsman_id: number;
  batsman_name: string;
  batsman_short_name: string | null;
  bowler_id: number;
  bowler_name: string;
  bowler_short_name: string | null;
  balls_faced: number;
}

export async function GET(request: NextRequest) {
  try {
    const rawParams = Object.fromEntries(
      request.nextUrl.searchParams.entries()
    );
    const parsed = TopRivalriesQuerySchema.safeParse(rawParams);

    const limit = parsed.success ? parsed.data.limit : 4;

    const rivalries: RivalryRow[] = await prisma.$queryRaw`
      SELECT 
        bc.batsman_id,
        bp.title AS batsman_name,
        bp.short_name AS batsman_short_name,
        bc.bowler_id,
        bw.title AS bowler_name,
        bw.short_name AS bowler_short_name,
        COUNT(CASE WHEN bc.is_wide = false THEN 1 END)::int AS balls_faced
      FROM ball_commentary bc
      JOIN players bp ON bc.batsman_id = bp.player_id
      JOIN players bw ON bc.bowler_id = bw.player_id
      GROUP BY bc.batsman_id, bp.title, bp.short_name, bc.bowler_id, bw.title, bw.short_name
      HAVING COUNT(CASE WHEN bc.is_wide = false THEN 1 END) >= 15
      ORDER BY balls_faced DESC
      LIMIT ${limit};
    `;

    return successResponse(rivalries);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return errorResponse(message, 500);
  }
}
