import "dotenv/config";
import { prisma } from "../../src/lib/prisma";
import { createIngestionContext } from "./utils/context";
import { ingestCareerStats } from "./modules/ingestCareerStats";
import { ingestCommentary } from "./modules/ingestCommentary";
import { ingestCompetitions } from "./modules/ingestCompetitions";
import { ingestMatches } from "./modules/ingestMatches";
import { ingestPlayers } from "./modules/ingestPlayers";
import { ingestStandings } from "./modules/ingestStandings";
import { ingestTeams } from "./modules/ingestTeams";
import { ingestVenues } from "./modules/ingestVenues";
import { ingestWagonWheel } from "./modules/ingestWagonWheel";

export async function runIngestionPipeline(): Promise<void> {
  console.log("🚀 Starting IPL 2022 Data Ingestion Pipeline...");
  const startTime = Date.now();
  const ctx = createIngestionContext();

  try {
    await ingestCompetitions(ctx);
    await ingestTeams(ctx);
    await ingestPlayers(ctx);
    await ingestVenues(ctx);
    await ingestMatches(ctx);
    await ingestCommentary(ctx);
    await ingestWagonWheel(ctx);
    await ingestStandings(ctx);
    await ingestCareerStats(ctx);

    const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(
      `\n🎉 Ingestion Pipeline Completed Successfully in ${durationSec}s!`
    );
  } catch (error) {
    console.error("❌ Data Ingestion Failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
