import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

interface OrangeCapRow {
  player_id: number;
  player_name: string;
  short_name: string | null;
  logo_url: string | null;
  thumb_url: string | null;
  matches: number;
  total_runs: number;
  balls_faced: number;
  fours: number;
  sixes: number;
  highest_score: number;
  strike_rate: number;
}

interface PurpleCapRow {
  player_id: number;
  player_name: string;
  short_name: string | null;
  logo_url: string | null;
  thumb_url: string | null;
  matches: number;
  total_wickets: number;
  total_overs: number;
  runs_conceded: number;
  dot_balls: number;
  economy: number;
}

interface BoundaryKingsRow {
  player_id: number;
  player_name: string;
  short_name: string | null;
  logo_url: string | null;
  thumb_url: string | null;
  total_sixes: number;
  total_fours: number;
  total_runs: number;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "runs";
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "10"))
    );

    if (type === "runs") {
      const orangeCap: OrangeCapRow[] = await prisma.$queryRaw`
        SELECT 
          sb.batsman_id AS player_id,
          p.title AS player_name,
          p.short_name,
          p.logo_url,
          p.thumb_url,
          COUNT(DISTINCT sb.match_id)::int AS matches,
          SUM(sb.runs)::int AS total_runs,
          SUM(sb.balls_faced)::int AS balls_faced,
          SUM(sb.fours)::int AS fours,
          SUM(sb.sixes)::int AS sixes,
          MAX(sb.runs)::int AS highest_score,
          ROUND((SUM(sb.runs)::numeric / NULLIF(SUM(sb.balls_faced), 0) * 100), 2)::float AS strike_rate
        FROM scorecard_batsmen sb
        JOIN players p ON sb.batsman_id = p.player_id
        GROUP BY sb.batsman_id, p.title, p.short_name, p.logo_url, p.thumb_url
        ORDER BY total_runs DESC, strike_rate DESC
        LIMIT ${limit};
      `;
      return successResponse(orangeCap, {
        leaderboardType: "orange_cap",
        limit,
      });
    }

    if (type === "wickets") {
      const purpleCap: PurpleCapRow[] = await prisma.$queryRaw`
        SELECT 
          sb.bowler_id AS player_id,
          p.title AS player_name,
          p.short_name,
          p.logo_url,
          p.thumb_url,
          COUNT(DISTINCT sb.match_id)::int AS matches,
          SUM(sb.wickets)::int AS total_wickets,
          SUM(sb.overs)::float AS total_overs,
          SUM(sb.runs_conceded)::int AS runs_conceded,
          SUM(sb.dot_balls)::int AS dot_balls,
          ROUND((SUM(sb.runs_conceded)::numeric / NULLIF(SUM(sb.overs), 0)), 2)::float AS economy
        FROM scorecard_bowlers sb
        JOIN players p ON sb.bowler_id = p.player_id
        GROUP BY sb.bowler_id, p.title, p.short_name, p.logo_url, p.thumb_url
        ORDER BY total_wickets DESC, economy ASC
        LIMIT ${limit};
      `;
      return successResponse(purpleCap, {
        leaderboardType: "purple_cap",
        limit,
      });
    }

    if (type === "sixes") {
      const boundaryKings: BoundaryKingsRow[] = await prisma.$queryRaw`
        SELECT 
          sb.batsman_id AS player_id,
          p.title AS player_name,
          p.short_name,
          p.logo_url,
          p.thumb_url,
          SUM(sb.sixes)::int AS total_sixes,
          SUM(sb.fours)::int AS total_fours,
          SUM(sb.runs)::int AS total_runs
        FROM scorecard_batsmen sb
        JOIN players p ON sb.batsman_id = p.player_id
        GROUP BY sb.batsman_id, p.title, p.short_name, p.logo_url, p.thumb_url
        ORDER BY total_sixes DESC, total_fours DESC
        LIMIT ${limit};
      `;
      return successResponse(boundaryKings, {
        leaderboardType: "boundary_kings",
        limit,
      });
    }

    return errorResponse(
      "Invalid leaderboard type. Valid options: runs, wickets, sixes.",
      400
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return errorResponse(message, 500);
  }
}
