import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { successResponse, errorResponse } from "@/lib/api-response";
import { registry } from "@/lib/openapi";
import { z } from "zod";

export const PlayersQuerySchema = z.object({
  search: z
    .string()
    .optional()
    .openapi({ description: "Search by player name or short name" }),
  role: z.string().optional().openapi({
    description: "Filter by playing role (batsman, bowler, allrounder, etc.)",
  }),
  team_id: z.coerce
    .number()
    .int()
    .optional()
    .openapi({ description: "Filter players by team ID" }),
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
    .max(100)
    .optional()
    .default(20)
    .openapi({ description: "Number of players per page (1-100)" }),
});

registry.registerPath({
  method: "get",
  path: "/api/v1/players",
  summary: "Player list with search and filters",
  request: {
    query: PlayersQuerySchema,
  },
  responses: {
    200: { description: "Paginated players list" },
    400: { description: "Invalid query parameters" },
  },
});

export async function GET(request: NextRequest) {
  try {
    const rawParams = Object.fromEntries(
      request.nextUrl.searchParams.entries()
    );
    const parsed = PlayersQuerySchema.safeParse(rawParams);

    if (!parsed.success) {
      return errorResponse(
        `Invalid query parameters: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
        400
      );
    }

    const { search, role, team_id: teamId, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const where: Prisma.playersWhereInput = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { short_name: { contains: search, mode: "insensitive" } },
        { first_name: { contains: search, mode: "insensitive" } },
        { last_name: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role && role.toLowerCase().trim() !== "all") {
      const r = role.toLowerCase().trim();
      let roleFilter = r;
      if (r === "batsman" || r === "bat") roleFilter = "bat";
      else if (r === "bowler" || r === "bowl") roleFilter = "bowl";
      else if (r === "allrounder" || r === "all-rounder" || r === "all_rounder")
        roleFilter = "all";
      else if (r === "keeper" || r === "wicketkeeper" || r === "wk")
        roleFilter = "wk";

      where.playing_role = { contains: roleFilter, mode: "insensitive" };
    }
    if (teamId) {
      where.team_squads = { some: { team_id: teamId } };
    }

    const [playersList, total] = await Promise.all([
      prisma.players.findMany({
        where,
        skip,
        take: limit,
        orderBy: { title: "asc" },
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
        },
      }),
      prisma.players.count({ where }),
    ]);

    return successResponse(playersList, {
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
