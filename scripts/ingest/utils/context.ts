export interface IngestionContext {
  competitionMap: Map<number, any>;
  venueMap: Map<number, any>;
  playerMap: Map<number, any>;
  teamIdsSet: Set<number>;
  inningToMatchMap: Map<number, number>;
}

export function createIngestionContext(): IngestionContext {
  return {
    competitionMap: new Map<number, any>(),
    venueMap: new Map<number, any>(),
    playerMap: new Map<number, any>(),
    teamIdsSet: new Set<number>(),
    inningToMatchMap: new Map<number, number>(),
  };
}
