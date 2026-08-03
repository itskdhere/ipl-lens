import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { registry } from "@/lib/openapi";
import { z } from "zod";

export const PlayerIdParamsSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive()
    .openapi({ description: "Player ID", example: 52 }),
});

registry.registerPath({
  method: "get",
  path: "/api/v1/players/{id}",
  summary: "Player profile details",
  tags: ["Players"],
  request: {
    params: PlayerIdParamsSchema,
  },
  responses: {
    200: { description: "Player metadata and squad affiliation" },
    400: { description: "Invalid player_id parameter" },
    404: { description: "Player not found" },
  },
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rawParams = await params;
    const parsed = PlayerIdParamsSchema.safeParse(rawParams);

    if (!parsed.success) {
      return errorResponse("Invalid player_id parameter", 400);
    }

    const playerId = parsed.data.id;

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
