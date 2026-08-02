import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

interface MatchupRow {
  batsman_id: number;
  batsman_name: string;
  batsman_short_name: string | null;
  bowler_id: number;
  bowler_name: string;
  bowler_short_name: string | null;
  balls_faced: number;
  total_runs: number;
  dismissals: number;
  dot_balls: number;
  fours: number;
  sixes: number;
  strike_rate: number;
  dot_ball_percentage: number;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const batsmanIdStr = searchParams.get("batsman_id");
    const bowlerIdStr = searchParams.get("bowler_id");

    if (!batsmanIdStr || !bowlerIdStr) {
      return errorResponse(
        "Both batsman_id and bowler_id query parameters are required.",
        400
      );
    }

    const batsmanId = parseInt(batsmanIdStr);
    const bowlerId = parseInt(bowlerIdStr);

    if (isNaN(batsmanId) || isNaN(bowlerId)) {
      return errorResponse(
        "batsman_id and bowler_id must be valid integers.",
        400
      );
    }

    const matchup: MatchupRow[] = await prisma.$queryRaw`
      SELECT 
        bc.batsman_id,
        bp.title AS batsman_name,
        bp.short_name AS batsman_short_name,
        bc.bowler_id,
        bw.title AS bowler_name,
        bw.short_name AS bowler_short_name,
        COUNT(CASE WHEN bc.is_wide = false THEN 1 END)::int AS balls_faced,
        SUM(bc.bat_runs)::int AS total_runs,
        COUNT(CASE WHEN bc.is_wicket = true AND bc.wicket_batsman_id = bc.batsman_id THEN 1 END)::int AS dismissals,
        COUNT(CASE WHEN bc.bat_runs = 0 AND bc.is_wide = false AND bc.is_noball = false THEN 1 END)::int AS dot_balls,
        COUNT(CASE WHEN bc.is_four = true THEN 1 END)::int AS fours,
        COUNT(CASE WHEN bc.is_six = true THEN 1 END)::int AS sixes,
        ROUND(
          (SUM(bc.bat_runs)::numeric / NULLIF(COUNT(CASE WHEN bc.is_wide = false THEN 1 END), 0) * 100), 
          2
        )::float AS strike_rate,
        ROUND(
          (COUNT(CASE WHEN bc.bat_runs = 0 AND bc.is_wide = false AND bc.is_noball = false THEN 1 END)::numeric / 
          NULLIF(COUNT(CASE WHEN bc.is_wide = false THEN 1 END), 0) * 100),
          2
        )::float AS dot_ball_percentage
      FROM ball_commentary bc
      JOIN players bp ON bc.batsman_id = bp.player_id
      JOIN players bw ON bc.bowler_id = bw.player_id
      WHERE bc.batsman_id = ${batsmanId} AND bc.bowler_id = ${bowlerId}
      GROUP BY bc.batsman_id, bp.title, bp.short_name, bc.bowler_id, bw.title, bw.short_name;
    `;

    if (!matchup.length) {
      const [batsman, bowler] = await Promise.all([
        prisma.players.findUnique({
          where: { player_id: batsmanId },
          select: { player_id: true, title: true, short_name: true },
        }),
        prisma.players.findUnique({
          where: { player_id: bowlerId },
          select: { player_id: true, title: true, short_name: true },
        }),
      ]);

      return successResponse({
        batsman_id: batsmanId,
        batsman_name: batsman?.title || null,
        batsman_short_name: batsman?.short_name || null,
        bowler_id: bowlerId,
        bowler_name: bowler?.title || null,
        bowler_short_name: bowler?.short_name || null,
        balls_faced: 0,
        total_runs: 0,
        dismissals: 0,
        dot_balls: 0,
        fours: 0,
        sixes: 0,
        strike_rate: 0,
        dot_ball_percentage: 0,
      });
    }

    return successResponse(matchup[0]);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return errorResponse(message, 500);
  }
}
