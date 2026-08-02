import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { registry } from "@/lib/openapi";
import { z } from "zod";

export const PlayerCareerParamsSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive()
    .openapi({ description: "Player ID", example: 52 }),
});

registry.registerPath({
  method: "get",
  path: "/api/v1/players/{id}/career",
  summary: "Multi-format career statistics",
  request: {
    params: PlayerCareerParamsSchema,
  },
  responses: {
    200: { description: "Career stats across formats" },
    400: { description: "Invalid player_id parameter" },
  },
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rawParams = await params;
    const parsed = PlayerCareerParamsSchema.safeParse(rawParams);

    if (!parsed.success) {
      return errorResponse("Invalid player_id parameter", 400);
    }

    const playerId = parsed.data.id;

    const careerStats = await prisma.player_career_stats.findMany({
      where: { player_id: playerId },
      orderBy: [{ format_str: "asc" }, { stat_type: "asc" }],
    });

    return successResponse(careerStats);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return errorResponse(message, 500);
  }
}
