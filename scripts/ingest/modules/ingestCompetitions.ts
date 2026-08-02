import fs from "fs";
import path from "path";
import { DATASET_DIR } from "../config";
import { prisma } from "../../../src/lib/prisma";
import { IngestionContext } from "../utils/context";
import { safeDate, safeInt, safeString } from "../utils/transformers";

export async function ingestCompetitions(ctx: IngestionContext): Promise<void> {
  console.log("\n1️⃣  Ingesting Competitions...");
  const matchInfoDir = path.join(DATASET_DIR, "match_info");
  if (!fs.existsSync(matchInfoDir)) return;

  const matchInfoFiles = fs
    .readdirSync(matchInfoDir)
    .filter((f) => f.endsWith(".json"));

  for (const file of matchInfoFiles) {
    const filePath = path.join(matchInfoDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    if (data.competition && data.competition.cid) {
      const comp = data.competition;
      const cid = safeInt(comp.cid)!;
      if (!ctx.competitionMap.has(cid)) {
        ctx.competitionMap.set(cid, {
          cid,
          title: safeString(comp.title) || "Indian Premier League",
          abbr: safeString(comp.abbr),
          type: safeString(comp.type),
          category: safeString(comp.category),
          match_format: safeString(comp.match_format),
          season: safeString(comp.season),
          status: safeString(comp.status),
          datestart: safeDate(comp.datestart),
          dateend: safeDate(comp.dateend),
          country: safeString(comp.country),
          total_matches: safeInt(comp.total_matches),
          total_rounds: safeInt(comp.total_rounds),
          total_teams: safeInt(comp.total_teams),
        });
      }
    }

    if (data.venue && data.venue.venue_id) {
      const vid = safeInt(data.venue.venue_id)!;
      if (!ctx.venueMap.has(vid)) {
        ctx.venueMap.set(vid, {
          venue_id: vid,
          name: safeString(data.venue.name) || "Unknown Venue",
          location: safeString(data.venue.location),
          country: safeString(data.venue.country),
          timezone: safeString(data.venue.timezone),
        });
      }
    }
  }

  for (const comp of ctx.competitionMap.values()) {
    await prisma.competitions.upsert({
      where: { cid: comp.cid },
      update: comp,
      create: comp,
    });
  }
  console.log(`   ✅ Ingested ${ctx.competitionMap.size} competitions.`);
}
