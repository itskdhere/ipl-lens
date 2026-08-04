import fs from "fs";
import path from "path";
import { DATASET_DIR } from "../config";
import { prisma } from "../../../src/lib/prisma";
import { IngestionContext } from "../utils/context";
import {
  safeDate,
  safeFkInt,
  safeFloat,
  safeInt,
  safeString,
} from "../utils/transformers";

interface SquadRecord {
  team_id: number;
  player_id: number;
  season: string;
  playing_role: string | null;
  fantasy_player_rating: number | null;
}

export async function ingestPlayers(ctx: IngestionContext): Promise<void> {
  console.log("\n3️⃣  Ingesting Players and Squads...");
  const squadsFilePath = path.join(DATASET_DIR, "squads", "squads.json");
  if (!fs.existsSync(squadsFilePath)) return;

  const squadsData = JSON.parse(fs.readFileSync(squadsFilePath, "utf-8"));

  const squadRecords: SquadRecord[] = [];

  for (const squadGroup of squadsData) {
    const team_id = safeFkInt(
      squadGroup.team_id || (squadGroup.team && squadGroup.team.tid)
    );
    const playersList = squadGroup.players || [];

    for (const p of playersList) {
      const player_id = safeInt(p.pid)!;
      if (!ctx.playerMap.has(player_id)) {
        ctx.playerMap.set(player_id, {
          player_id,
          title:
            safeString(p.title) ||
            `${p.first_name || ""} ${p.last_name || ""}`.trim() ||
            "Unknown Player",
          short_name: safeString(p.short_name),
          first_name: safeString(p.first_name),
          last_name: safeString(p.last_name),
          middle_name: safeString(p.middle_name),
          birthdate: safeDate(p.birthdate),
          birthplace: safeString(p.birthplace),
          country: safeString(p.country),
          nationality: safeString(p.nationality),
          playing_role: safeString(p.playing_role),
          batting_style: safeString(p.batting_style),
          bowling_style: safeString(p.bowling_style),
          fielding_position: safeString(p.fielding_position),
          logo_url: safeString(p.logo_url),
          thumb_url: safeString(p.thumb_url),
          facebook_profile: safeString(p.facebook_profile),
          twitter_profile: safeString(p.twitter_profile),
          instagram_profile: safeString(p.instagram_profile),
        });
      }

      if (team_id && ctx.teamIdsSet.has(team_id)) {
        squadRecords.push({
          team_id,
          player_id,
          season: "2022",
          playing_role: safeString(p.playing_role),
          fantasy_player_rating: safeFloat(p.fantasy_player_rating),
        });
      }
    }
  }

  for (const p of ctx.playerMap.values()) {
    await prisma.players.upsert({
      where: { player_id: p.player_id },
      update: p,
      create: p,
    });
  }
  console.log(`   ✅ Ingested ${ctx.playerMap.size} unique players.`);

  for (const sq of squadRecords) {
    try {
      await prisma.team_squads.upsert({
        where: {
          team_id_player_id_season: {
            team_id: sq.team_id,
            player_id: sq.player_id,
            season: sq.season,
          },
        },
        update: sq,
        create: sq,
      });
    } catch {}
  }
  console.log(`   ✅ Ingested ${squadRecords.length} squad relationships.`);
}
