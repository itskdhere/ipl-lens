import fs from "fs";
import path from "path";
import { DATASET_DIR } from "../config";
import { prisma } from "../../../src/lib/prisma";
import { IngestionContext } from "../utils/context";
import { safeInt, safeString } from "../utils/transformers";

export async function ingestTeams(ctx: IngestionContext): Promise<void> {
  console.log("\n2️⃣  Ingesting Teams...");
  const teamsFilePath = path.join(DATASET_DIR, "teams", "teams.json");
  if (!fs.existsSync(teamsFilePath)) return;

  const teamsData = JSON.parse(fs.readFileSync(teamsFilePath, "utf-8"));

  for (const t of teamsData) {
    const team_id = safeInt(t.tid)!;
    ctx.teamIdsSet.add(team_id);
    await prisma.teams.upsert({
      where: { team_id },
      update: {
        title: safeString(t.title) || "Unknown Team",
        abbr: safeString(t.abbr) || "",
        alt_name: safeString(t.alt_name),
        type: safeString(t.type),
        thumb_url: safeString(t.thumb_url),
        logo_url: safeString(t.logo_url),
        country: safeString(t.country),
        sex: safeString(t.sex),
      },
      create: {
        team_id,
        title: safeString(t.title) || "Unknown Team",
        abbr: safeString(t.abbr) || "",
        alt_name: safeString(t.alt_name),
        type: safeString(t.type),
        thumb_url: safeString(t.thumb_url),
        logo_url: safeString(t.logo_url),
        country: safeString(t.country),
        sex: safeString(t.sex),
      },
    });
  }
  console.log(`   ✅ Ingested ${teamsData.length} teams.`);
}
