import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { registry } from "@/lib/openapi";
import { z } from "zod";

export const MatchScorecardParamsSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive()
    .openapi({ description: "Match ID", example: 105 }),
});

registry.registerPath({
  method: "get",
  path: "/api/v1/matches/{id}/scorecard",
  summary: "Full match scorecard",
  request: {
    params: MatchScorecardParamsSchema,
  },
  responses: {
    200: { description: "Batting and bowling scorecards" },
    400: { description: "Invalid match_id parameter" },
    404: { description: "Scorecard not found" },
  },
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rawParams = await params;
    const parsed = MatchScorecardParamsSchema.safeParse(rawParams);

    if (!parsed.success) {
      return errorResponse("Invalid match_id parameter", 400);
    }

    const matchId = parsed.data.id;

    const innings = await prisma.match_innings.findMany({
      where: { match_id: matchId },
      orderBy: { inning_number: "asc" },
      include: {
        teams_match_innings_batting_team_idToteams: {
          select: { team_id: true, title: true, abbr: true, logo_url: true },
        },
        teams_match_innings_fielding_team_idToteams: {
          select: { team_id: true, title: true, abbr: true, logo_url: true },
        },
        scorecard_batsmen: {
          orderBy: { batting_position: "asc" },
          include: {
            players_scorecard_batsmen_batsman_idToplayers: {
              select: { player_id: true, title: true, short_name: true },
            },
            players_scorecard_batsmen_bowler_idToplayers: {
              select: { player_id: true, title: true, short_name: true },
            },
            players_scorecard_batsmen_first_fielder_idToplayers: {
              select: { player_id: true, title: true, short_name: true },
            },
          },
        },
        scorecard_bowlers: {
          include: {
            players: {
              select: { player_id: true, title: true, short_name: true },
            },
          },
        },
      },
    });

    if (!innings.length) {
      return errorResponse(`Scorecard for match ID ${matchId} not found`, 404);
    }

    return successResponse(innings);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return errorResponse(message, 500);
  }
}
