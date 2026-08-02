import fs from "fs";
import path from "path";
import { DATASET_DIR } from "../config";
import { prisma } from "../../../src/lib/prisma";
import { IngestionContext } from "../utils/context";
import {
  safeFkInt,
  safeFloat,
  safeInt,
  safeString,
} from "../utils/transformers";

export async function ingestCareerStats(ctx: IngestionContext): Promise<void> {
  console.log("\n9️⃣  Ingesting Player Career Statistics (Across Formats)...");
  const statsDir = path.join(DATASET_DIR, "player_career_stats");
  if (!fs.existsSync(statsDir)) return;

  const statsFiles = fs
    .readdirSync(statsDir)
    .filter((f) => f.endsWith(".json"));

  let careerStatsCount = 0;

  for (const file of statsFiles) {
    const filePath = path.join(statsDir, file);
    const sData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const player_id = safeFkInt(sData.player?.pid);

    if (!player_id) continue;

    // Batting Formats
    const battingObj = sData.batting || {};
    for (const formatStr of Object.keys(battingObj)) {
      const b = battingObj[formatStr];
      if (!b || (b.matches === 0 && b.runs === 0)) continue;

      await prisma.player_career_stats.upsert({
        where: {
          player_id_format_str_stat_type: {
            player_id,
            format_str: formatStr,
            stat_type: "batting",
          },
        },
        update: {
          matches: safeInt(b.matches, 0),
          innings: safeInt(b.innings, 0),
          runs: safeInt(b.runs, 0),
          balls: safeInt(b.balls, 0),
          highest_score: safeString(b.highest),
          average: safeFloat(b.average),
          strike_rate: safeFloat(b.strike),
          hundreds: safeInt(b.run100, 0),
          fifties: safeInt(b.run50, 0),
          fours: safeInt(b.run4, 0),
          sixes: safeInt(b.run6, 0),
        },
        create: {
          player_id,
          format_str: formatStr,
          stat_type: "batting",
          matches: safeInt(b.matches, 0),
          innings: safeInt(b.innings, 0),
          runs: safeInt(b.runs, 0),
          balls: safeInt(b.balls, 0),
          highest_score: safeString(b.highest),
          average: safeFloat(b.average),
          strike_rate: safeFloat(b.strike),
          hundreds: safeInt(b.run100, 0),
          fifties: safeInt(b.run50, 0),
          fours: safeInt(b.run4, 0),
          sixes: safeInt(b.run6, 0),
        },
      });
      careerStatsCount++;
    }

    // Bowling Formats
    const bowlingObj = sData.bowling || {};
    for (const formatStr of Object.keys(bowlingObj)) {
      const bw = bowlingObj[formatStr];
      if (!bw || (bw.matches === 0 && bw.wickets === 0)) continue;

      await prisma.player_career_stats.upsert({
        where: {
          player_id_format_str_stat_type: {
            player_id,
            format_str: formatStr,
            stat_type: "bowling",
          },
        },
        update: {
          matches: safeInt(bw.matches, 0),
          innings: safeInt(bw.innings, 0),
          runs: safeInt(bw.runs, 0),
          balls: safeInt(bw.balls, 0),
          wickets: safeInt(bw.wickets, 0),
          best_bowling: safeString(bw.bestmatch || bw.bestinning),
          economy: safeFloat(bw.econ),
          average: safeFloat(bw.average),
          strike_rate: safeFloat(bw.strike),
          four_wickets: safeInt(bw.wicket4i, 0),
          five_wickets: safeInt(bw.wicket5i, 0),
        },
        create: {
          player_id,
          format_str: formatStr,
          stat_type: "bowling",
          matches: safeInt(bw.matches, 0),
          innings: safeInt(bw.innings, 0),
          runs: safeInt(bw.runs, 0),
          balls: safeInt(bw.balls, 0),
          wickets: safeInt(bw.wickets, 0),
          best_bowling: safeString(bw.bestmatch || bw.bestinning),
          economy: safeFloat(bw.econ),
          average: safeFloat(bw.average),
          strike_rate: safeFloat(bw.strike),
          four_wickets: safeInt(bw.wicket4i, 0),
          five_wickets: safeInt(bw.wicket5i, 0),
        },
      });
      careerStatsCount++;
    }
  }

  console.log(
    `   ✅ Ingested ${careerStatsCount} player career statistics records.`
  );
}
