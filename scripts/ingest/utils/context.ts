import { Prisma } from "../../../src/generated/prisma/client";

export interface IngestionContext {
  competitionMap: Map<number, Prisma.competitionsCreateInput>;
  venueMap: Map<number, Prisma.venuesCreateInput>;
  playerMap: Map<number, Prisma.playersCreateInput>;
  teamIdsSet: Set<number>;
  inningToMatchMap: Map<number, number>;
}

export function createIngestionContext(): IngestionContext {
  return {
    competitionMap: new Map<number, Prisma.competitionsCreateInput>(),
    venueMap: new Map<number, Prisma.venuesCreateInput>(),
    playerMap: new Map<number, Prisma.playersCreateInput>(),
    teamIdsSet: new Set<number>(),
    inningToMatchMap: new Map<number, number>(),
  };
}
