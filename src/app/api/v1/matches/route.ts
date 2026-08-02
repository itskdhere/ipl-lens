import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { successResponse, errorResponse } from "@/lib/api-response";
import { registry } from "@/lib/openapi";
import { z } from "zod";

export const MatchesQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .optional()
    .default(1)
    .openapi({ description: "Page number (default 1)" }),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .default(10)
    .openapi({ description: "Number of matches per page (1-50)" }),
  team_id: z.coerce
    .number()
    .int()
    .optional()
    .openapi({ description: "Filter matches by team ID" }),
  venue_id: z.coerce
    .number()
    .int()
    .optional()
    .openapi({ description: "Filter matches by venue ID" }),
});

registry.registerPath({
  method: "get",
  path: "/api/v1/matches",
  summary: "Paginated list of matches",
  request: {
    query: MatchesQuerySchema,
  },
  responses: {
    200: { description: "Paginated matches list" },
    400: { description: "Invalid query parameters" },
  },
});

export async function GET(request: NextRequest) {
  try {
    const rawParams = Object.fromEntries(
      request.nextUrl.searchParams.entries()
    );
    const parsed = MatchesQuerySchema.safeParse(rawParams);

    if (!parsed.success) {
      return errorResponse(
        `Invalid query parameters: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
        400
      );
    }

    const { page, limit, team_id: teamId, venue_id: venueId } = parsed.data;
    const skip = (page - 1) * limit;

    const where: Prisma.matchesWhereInput = {};
    if (teamId) {
      where.OR = [{ teama_id: teamId }, { teamb_id: teamId }];
    }
    if (venueId) {
      where.venue_id = venueId;
    }

    const [matches, total] = await Promise.all([
      prisma.matches.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date_start: "desc" },
        include: {
          teams_matches_teama_idToteams: {
            select: { team_id: true, title: true, abbr: true, logo_url: true },
          },
          teams_matches_teamb_idToteams: {
            select: { team_id: true, title: true, abbr: true, logo_url: true },
          },
          teams_matches_winning_team_idToteams: {
            select: { team_id: true, title: true, abbr: true },
          },
          venues: { select: { venue_id: true, name: true, location: true } },
          players: {
            select: { player_id: true, title: true, short_name: true },
          },
        },
      }),
      prisma.matches.count({ where }),
    ]);

    const formattedMatches = matches.map((m) => ({
      match_id: m.match_id,
      title: m.title,
      short_title: m.short_title,
      subtitle: m.subtitle,
      match_number: m.match_number,
      status: m.status_str,
      status_note: m.status_note,
      date_start: m.date_start,
      date_start_ist: m.date_start_ist,
      team_a: m.teams_matches_teama_idToteams,
      team_b: m.teams_matches_teamb_idToteams,
      team_a_score: m.teama_score,
      team_b_score: m.teamb_score,
      team_a_overs: m.teama_overs,
      team_b_overs: m.teamb_overs,
      venue: m.venues,
      result: m.result,
      win_margin: m.win_margin,
      winning_team: m.teams_matches_winning_team_idToteams,
      man_of_the_match: m.players,
      toss_text: m.toss_text,
    }));

    return successResponse(formattedMatches, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return errorResponse(message, 500);
  }
}
