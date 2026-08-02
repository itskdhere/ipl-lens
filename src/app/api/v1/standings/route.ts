import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { registry } from "@/lib/openapi";

registry.registerPath({
  method: "get",
  path: "/api/v1/standings",
  summary: "IPL 2022 Tournament Standings / Points Table",
  responses: {
    200: {
      description: "Points table with NRR and recent form",
    },
  },
});

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
