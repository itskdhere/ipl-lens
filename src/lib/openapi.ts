import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

export function getOpenApiDocumentation() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "IPL Lens - API",
      version: "1.0.0",
      description:
        "API documentation for IPL 2022 data analytics platform covering tournament standings, leaderboards, match scorecards, player profiles, wagon wheel spatial shots, and H2H matchups.",
    },
    tags: [
      {
        name: "Analytics",
        description:
          "Head-to-Head (H2H) player matchup analytics and top matchups",
      },
      {
        name: "Leaderboards",
        description:
          "Season leaderboards for Orange Cap, Purple Cap, and Boundary Kings",
      },
      {
        name: "Matches",
        description:
          "Match listings, scorecards, worm charts, and phase-wise analytics",
      },
      {
        name: "Players",
        description:
          "Player profiles, career statistics, and spatial wagon wheel shot charts",
      },
      {
        name: "Standings",
        description: "Tournament points table, rankings, and NRR statistics",
      },
      {
        name: "System",
        description: "Health check and system metrics endpoints",
      },
      {
        name: "Venues",
        description: "Venue analytics and ground performance statistics",
      },
    ],
  });
}
