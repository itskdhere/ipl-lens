import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const standingsList = await prisma.standings.findMany({
      include: {
        teams: {
          select: {
            team_id: true,
            title: true,
            abbr: true,
            logo_url: true,
            thumb_url: true,
          },
        },
      },
      orderBy: [{ points: "desc" }, { net_rr: "desc" }],
    });

    return successResponse(standingsList);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return errorResponse(message, 500);
  }
}
