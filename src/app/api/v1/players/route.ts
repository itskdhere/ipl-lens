import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20"))
    );
    const search = searchParams.get("search");
    const role = searchParams.get("role");
    const teamId = searchParams.get("team_id")
      ? parseInt(searchParams.get("team_id")!)
      : undefined;
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
    if (role) {
      where.playing_role = { contains: role, mode: "insensitive" };
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
