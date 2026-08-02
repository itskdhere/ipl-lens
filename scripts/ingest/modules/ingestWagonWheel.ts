import fs from "fs";
import path from "path";
import { prisma } from "../../../src/lib/prisma";
import { DATASET_DIR, ZONE_NAMES } from "../config";
import { IngestionContext } from "../utils/context";
import {
  safeFkInt,
  safeFloat,
  safeInt,
  safeString,
} from "../utils/transformers";

export async function ingestWagonWheel(ctx: IngestionContext): Promise<void> {
  console.log("\n7️⃣  Ingesting Wagon Wheel Spatial Shot Coordinates...");
  const wagonDir = path.join(DATASET_DIR, "match_wagon_wheel");
  if (!fs.existsSync(wagonDir)) return;

  const wagonFiles = fs
    .readdirSync(wagonDir)
    .filter((f) => f.endsWith(".json"));

  let wagonBatch: any[] = [];
  let totalWagonShotsCount = 0;

  for (const file of wagonFiles) {
    const filePath = path.join(wagonDir, file);
    const wagonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const inningsList = wagonData.innings || [];

    for (const inn of inningsList) {
      const inning_id = safeInt(inn.inning_id);
      const match_id = inning_id ? ctx.inningToMatchMap.get(inning_id) : null;
      if (!match_id) continue;

      const wagons = inn.wagons || [];

      for (const w of wagons) {
        // [batsman_id, bowler_id, over, bat_run, team_run, x, y, zone_id, event_name, unique_over]
        const rawBatsmanId = safeFkInt(w[0]);
        const rawBowlerId = safeFkInt(w[1]);
        const batsman_id =
          rawBatsmanId && ctx.playerMap.has(rawBatsmanId) ? rawBatsmanId : null;
        const bowler_id =
          rawBowlerId && ctx.playerMap.has(rawBowlerId) ? rawBowlerId : null;
        const over_number = safeInt(w[2], 0)!;
        const bat_runs = safeInt(w[3], 0);
        const team_runs = safeInt(w[4], 0);
        const coord_x = safeInt(w[5], 0)!;
        const coord_y = safeInt(w[6], 0)!;
        const rawZoneId = safeInt(w[7], 1)!;
        const zone_id = rawZoneId < 1 ? 1 : rawZoneId > 8 ? 8 : rawZoneId;
        const event_name = safeString(w[8]);
        const unique_over = safeFloat(w[9], 0.0)!;

        wagonBatch.push({
          match_id,
          inning_id,
          batsman_id,
          bowler_id,
          over_number,
          unique_over,
          bat_runs,
          team_runs,
          coord_x,
          coord_y,
          zone_id,
          zone_name: ZONE_NAMES[zone_id - 1] || "Fine Leg",
          event_name,
        });

        if (wagonBatch.length >= 1000) {
          await prisma.wagon_wheel_shots.createMany({
            data: wagonBatch,
          });
          totalWagonShotsCount += wagonBatch.length;
          wagonBatch = [];
        }
      }
    }
  }

  if (wagonBatch.length > 0) {
    await prisma.wagon_wheel_shots.createMany({
      data: wagonBatch,
    });
    totalWagonShotsCount += wagonBatch.length;
  }
  console.log(`   ✅ Ingested ${totalWagonShotsCount} wagon wheel shots.`);
}
