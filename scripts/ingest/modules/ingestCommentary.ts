import fs from "fs";
import path from "path";
import { DATASET_DIR } from "../config";
import { prisma } from "../../../src/lib/prisma";
import { IngestionContext } from "../utils/context";
import {
  safeBool,
  safeFkInt,
  safeInt,
  safeString,
} from "../utils/transformers";

export async function ingestCommentary(ctx: IngestionContext): Promise<void> {
  console.log("\n6️⃣  Ingesting Ball-by-Ball Commentary...");
  const commDir = path.join(DATASET_DIR, "match_innings_commentary");
  if (!fs.existsSync(commDir)) return;

  const commFiles = fs.readdirSync(commDir).filter((f) => f.endsWith(".json"));

  let ballCommentaryBatch: any[] = [];
  let totalBallsCount = 0;

  for (const file of commFiles) {
    const filePath = path.join(commDir, file);
    const commData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const inning_id = safeInt(commData.inning?.iid);
    const match_id =
      safeInt(commData.match?.match_id) ||
      (inning_id ? ctx.inningToMatchMap.get(inning_id) : null);

    if (!match_id) continue;

    const commentaries = commData.commentaries || [];

    for (const c of commentaries) {
      if (c.event === "overend") continue; // Skip over summaries

      const event_id = BigInt(
        c.event_id || `${match_id}${inning_id}${c.over}${c.ball}${Date.now()}`
      );
      const rawBatsmanId = safeFkInt(c.batsman_id);
      const rawBowlerId = safeFkInt(c.bowler_id);
      const rawWicketBatsmanId = safeFkInt(c.wicket_batsman_id);
      const batsman_id =
        rawBatsmanId && ctx.playerMap.has(rawBatsmanId) ? rawBatsmanId : null;
      const bowler_id =
        rawBowlerId && ctx.playerMap.has(rawBowlerId) ? rawBowlerId : null;
      const wicket_batsman_id =
        rawWicketBatsmanId && ctx.playerMap.has(rawWicketBatsmanId)
          ? rawWicketBatsmanId
          : null;

      ballCommentaryBatch.push({
        event_id,
        match_id,
        inning_id,
        over_number: safeInt(c.over, 0)!,
        ball_number: safeInt(c.ball, 0)!,
        batsman_id,
        bowler_id,
        total_runs: safeInt(c.run, 0),
        bat_runs: safeInt(c.bat_run, 0),
        noball_runs: safeInt(c.noball_run, 0),
        wide_runs: safeInt(c.wide_run, 0),
        bye_runs: safeInt(c.bye_run, 0),
        legbye_runs: safeInt(c.legbye_run, 0),
        is_four: safeBool(c.four),
        is_six: safeBool(c.six),
        is_noball: safeBool(c.noball),
        is_wide: safeBool(c.wideball),
        is_wicket: c.event === "wicket" || safeBool(c.wicket_batsman_id),
        wicket_batsman_id,
        how_out: safeString(c.how_out),
        commentary_text: safeString(c.commentary),
        event_timestamp: c.timestamp ? BigInt(c.timestamp) : null,
      });

      if (ballCommentaryBatch.length >= 1000) {
        await prisma.ball_commentary.createMany({
          data: ballCommentaryBatch,
          skipDuplicates: true,
        });
        totalBallsCount += ballCommentaryBatch.length;
        ballCommentaryBatch = [];
      }
    }
  }

  if (ballCommentaryBatch.length > 0) {
    await prisma.ball_commentary.createMany({
      data: ballCommentaryBatch,
      skipDuplicates: true,
    });
    totalBallsCount += ballCommentaryBatch.length;
  }
  console.log(`   ✅ Ingested ${totalBallsCount} ball commentary events.`);
}
