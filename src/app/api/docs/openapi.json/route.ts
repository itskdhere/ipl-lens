import { NextResponse } from "next/server";
import { getOpenApiDocumentation } from "@/lib/openapi";

import "@/app/api/health/route";
import "@/app/api/v1/standings/route";
import "@/app/api/v1/leaderboards/route";
import "@/app/api/v1/venues/route";
import "@/app/api/v1/matches/route";
import "@/app/api/v1/matches/[id]/route";
import "@/app/api/v1/matches/[id]/scorecard/route";
import "@/app/api/v1/matches/[id]/worm/route";
import "@/app/api/v1/matches/[id]/phase-analytics/route";
import "@/app/api/v1/players/route";
import "@/app/api/v1/players/[id]/route";
import "@/app/api/v1/players/[id]/career/route";
import "@/app/api/v1/players/[id]/wagon-wheel/route";
import "@/app/api/v1/analytics/matchups/route";
import "@/app/api/v1/analytics/matchups/top/route";

export async function GET() {
  const openApiSpec = getOpenApiDocumentation();
  return NextResponse.json(openApiSpec);
}
