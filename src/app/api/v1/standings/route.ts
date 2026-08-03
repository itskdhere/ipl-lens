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

    const seenTeams = new Set<number>();
    const uniqueStandings = standingsList
      .filter((item) => {
        const id = item.team_id || item.teams?.team_id;
        if (!id || seenTeams.has(id)) return false;
        seenTeams.add(id);
        return true;
      })
      .map((item) => ({
        ...item,
        wins: item.win ?? 0,
        losses: item.loss ?? 0,
        recent_form: item.last_five_form ? item.last_five_form.split(",") : [],
      }));

    return successResponse(uniqueStandings);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return errorResponse(message, 500);
  }
}
