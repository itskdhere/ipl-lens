import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

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

    const match = await prisma.matches.findUnique({
      where: { match_id: matchId },
      include: {
        venues: true,
        teams_matches_teama_idToteams: true,
        teams_matches_teamb_idToteams: true,
        teams_matches_winning_team_idToteams: true,
        teams_matches_toss_winner_idToteams: true,
        players: true,
        match_innings: {
          orderBy: { inning_number: "asc" },
          include: {
            teams_match_innings_batting_team_idToteams: {
              select: {
                team_id: true,
                title: true,
                abbr: true,
                logo_url: true,
              },
            },
          },
        },
      },
    });

    if (!match) {
      return errorResponse(`Match with ID ${matchId} not found`, 404);
    }

    return successResponse(match);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return errorResponse(message, 500);
  }
}
