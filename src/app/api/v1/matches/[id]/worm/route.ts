import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

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
    const { id } = await params;
    const matchId = parseInt(id);

    if (isNaN(matchId)) {
      return errorResponse("Invalid match_id parameter", 400);
    }

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
      WHERE bc.match_id = ${matchId}
      GROUP BY bc.inning_id, mi.inning_number, mi.short_name, bc.over_number
      ORDER BY mi.inning_number ASC, bc.over_number ASC;
    `;

    return successResponse(overProgression);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return errorResponse(message, 500);
  }
}
