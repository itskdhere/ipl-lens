import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

interface PhaseAnalyticsRow {
  inning_id: number;
  inning_number: number;
  team_name: string;
  match_phase: string;
  runs_scored: number;
  wickets_lost: number;
  legal_balls_faced: number;
  fours: number;
  sixes: number;
  run_rate: number;
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

    const phaseAnalytics: PhaseAnalyticsRow[] = await prisma.$queryRaw`
      SELECT 
        bc.inning_id,
        mi.inning_number,
        mi.short_name AS team_name,
        CASE 
          WHEN bc.over_number BETWEEN 1 AND 6 THEN 'Powerplay (Overs 1-6)'
          WHEN bc.over_number BETWEEN 7 AND 15 THEN 'Middle Overs (Overs 7-15)'
          WHEN bc.over_number BETWEEN 16 AND 20 THEN 'Death Overs (Overs 16-20)'
          ELSE 'Other'
        END AS match_phase,
        SUM(bc.total_runs)::int AS runs_scored,
        COUNT(CASE WHEN bc.is_wicket = true THEN 1 END)::int AS wickets_lost,
        COUNT(bc.event_id)::int AS legal_balls_faced,
        COUNT(CASE WHEN bc.is_four = true THEN 1 END)::int AS fours,
        COUNT(CASE WHEN bc.is_six = true THEN 1 END)::int AS sixes,
        ROUND((SUM(bc.total_runs)::numeric / NULLIF(COUNT(bc.event_id), 0) * 6), 2)::float AS run_rate
      FROM ball_commentary bc
      JOIN match_innings mi ON bc.inning_id = mi.inning_id
      WHERE bc.match_id = ${matchId}
      GROUP BY bc.inning_id, mi.inning_number, mi.short_name, match_phase
      ORDER BY mi.inning_number ASC, 
        CASE match_phase
          WHEN 'Powerplay (Overs 1-6)' THEN 1
          WHEN 'Middle Overs (Overs 7-15)' THEN 2
          WHEN 'Death Overs (Overs 16-20)' THEN 3
          ELSE 4
        END;
    `;

    return successResponse(phaseAnalytics);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return errorResponse(message, 500);
  }
}
