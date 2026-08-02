import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const playerId = parseInt(id);

    if (isNaN(playerId)) {
      return errorResponse("Invalid player_id parameter", 400);
    }

    const player = await prisma.players.findUnique({
      where: { player_id: playerId },
      include: {
        team_squads: {
          include: {
            teams: {
              select: {
                team_id: true,
                title: true,
                abbr: true,
                logo_url: true,
              },
            },
          },
        },
        player_career_stats: {
          orderBy: { format_str: "asc" },
        },
      },
    });

    if (!player) {
      return errorResponse(`Player with ID ${playerId} not found`, 404);
    }

    return successResponse(player);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return errorResponse(message, 500);
  }
}
