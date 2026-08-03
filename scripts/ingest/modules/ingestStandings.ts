import fs from "fs";
import path from "path";
import { DATASET_DIR } from "../config";
import { prisma } from "../../../src/lib/prisma";
import {
  safeFkInt,
  safeFloat,
  safeInt,
  safeString,
} from "../utils/transformers";

export async function ingestStandings(): Promise<void> {
  console.log("\n8️⃣  Ingesting Tournament Standings...");
  const standingsFilePath = path.join(
    DATASET_DIR,
    "standings",
    "standings.json"
  );
  if (!fs.existsSync(standingsFilePath)) return;

  await prisma.standings.deleteMany({});

  const standingsData = JSON.parse(fs.readFileSync(standingsFilePath, "utf-8"));

  const standingsList = standingsData.standings?.[0]?.standings || [];
  let standingsCount = 0;

  for (const st of standingsList) {
    const team_id = safeFkInt(st.team_id || st.team?.tid);
    const competition_id = 123213; // IPL 2022 Competition ID

    await prisma.standings.create({
      data: {
        competition_id,
        team_id,
        played: safeInt(st.played, 0),
        win: safeInt(st.win, 0),
        loss: safeInt(st.loss, 0),
        draw_nr: safeInt(st.draw || st.nr, 0),
        points: safeInt(st.points, 0),
        net_rr: safeFloat(st.netrr),
        last_five_form: safeString(st.lastfivematchresult),
      },
    });
    standingsCount++;
  }
  console.log(`   ✅ Ingested ${standingsCount} team standings records.`);
}
