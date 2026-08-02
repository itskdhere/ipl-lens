import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { registry } from "@/lib/openapi";
import { z } from "zod";

export const MatchIdParamsSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive()
    .openapi({ description: "Match ID", example: 105 }),
});

registry.registerPath({
  method: "get",
  path: "/api/v1/matches/{id}",
  summary: "Match detail metadata",
  request: {
    params: MatchIdParamsSchema,
  },
  responses: {
    200: { description: "Match metadata" },
    400: { description: "Invalid match_id parameter" },
    404: { description: "Match not found" },
  },
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rawParams = await params;
    const parsed = MatchIdParamsSchema.safeParse(rawParams);

    if (!parsed.success) {
      return errorResponse("Invalid match_id parameter", 400);
    }

    const matchId = parsed.data.id;

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
