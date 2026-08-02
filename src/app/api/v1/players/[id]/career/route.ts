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
