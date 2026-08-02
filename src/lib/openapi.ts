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
  });
}
