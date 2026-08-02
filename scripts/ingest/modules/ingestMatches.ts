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

export async function ingestMatches(ctx: IngestionContext): Promise<void> {
  console.log("\n5️⃣  Ingesting Matches, Innings, and Detailed Scorecards...");

  const scorecardMap = new Map<number, any>();
  const scorecardsDir = path.join(DATASET_DIR, "scorecards");
  if (fs.existsSync(scorecardsDir)) {
    const scFiles = fs
      .readdirSync(scorecardsDir)
      .filter((f) => f.endsWith(".json"));
    for (const f of scFiles) {
      const scData = JSON.parse(
        fs.readFileSync(path.join(scorecardsDir, f), "utf-8")
      );
      if (scData.match_id) {
        scorecardMap.set(safeInt(scData.match_id)!, scData);
      }
    }
  }

  let matchesList: any[] = [];
  const matchesFilePath = path.join(DATASET_DIR, "matches", "matches.json");
  if (fs.existsSync(matchesFilePath)) {
    matchesList = JSON.parse(fs.readFileSync(matchesFilePath, "utf-8"));
  } else {
    const matchInfoDir = path.join(DATASET_DIR, "match_info");
    if (fs.existsSync(matchInfoDir)) {
      const infoFiles = fs
        .readdirSync(matchInfoDir)
        .filter((f) => f.endsWith(".json"));
      for (const f of infoFiles) {
        matchesList.push(
          JSON.parse(fs.readFileSync(path.join(matchInfoDir, f), "utf-8"))
        );
      }
    }
  }

  let insertedMatchesCount = 0;
  let insertedInningsCount = 0;
  let insertedBatsmenCount = 0;
  let insertedBowlersCount = 0;

  for (const m of matchesList) {
    const match_id = safeInt(m.match_id);
    if (!match_id) continue;

    const competition_id = safeFkInt(m.competition?.cid);
    const teama_id = safeFkInt(m.teama?.team_id);
    const teamb_id = safeFkInt(m.teamb?.team_id);
    const winning_team_id = safeFkInt(m.winning_team_id);
    const man_of_the_match_id = safeFkInt(m.man_of_the_match?.pid);
    const toss_winner_id = safeFkInt(m.toss?.winner);
    const venue_id = safeFkInt(m.venue?.venue_id);

    // Ensure Man of the Match exists in players table
    if (man_of_the_match_id && !ctx.playerMap.has(man_of_the_match_id)) {
      const motm = m.man_of_the_match;
      await prisma.players.upsert({
        where: { player_id: man_of_the_match_id },
        update: {},
        create: {
          player_id: man_of_the_match_id,
          title: safeString(motm?.name) || "Unknown Player",
        },
      });
      ctx.playerMap.set(man_of_the_match_id, true);
    }

    const matchData = {
      match_id,
      competition_id,
      title: safeString(m.title),
      short_title: safeString(m.short_title),
      subtitle: safeString(m.subtitle),
      match_number: safeString(m.match_number),
      format_str: safeString(m.format_str),
      status_id: safeInt(m.status),
      status_str: safeString(m.status_str),
      status_note: safeString(m.status_note),
      teama_id,
      teamb_id,
      teama_score: safeString(m.teama?.scores),
      teamb_score: safeString(m.teamb?.scores),
      teama_overs: safeString(m.teama?.overs),
      teamb_overs: safeString(m.teamb?.overs),
      date_start: safeDate(m.date_start),
      date_end: safeDate(m.date_end),
      date_start_ist: safeDate(m.date_start_ist),
      venue_id,
      umpires: safeString(m.umpires),
      referee: safeString(m.referee),
      result: safeString(m.result),
      result_type: safeInt(m.result_type),
      win_margin: safeString(m.win_margin),
      winning_team_id,
      man_of_the_match_id,
      toss_text: safeString(m.toss?.text),
      toss_winner_id,
      toss_decision: safeInt(m.toss?.decision),
    };

    await prisma.matches.upsert({
      where: { match_id },
      update: matchData,
      create: matchData,
    });
    insertedMatchesCount++;

    // Ingest Innings & Scorecards if available
    const scData = scorecardMap.get(match_id);

    if (scData) {
      const inningsList = scData.innings || [];

      for (const inn of inningsList) {
        const inning_id = safeInt(inn.iid)!;
        const batting_team_id = safeFkInt(inn.batting_team_id);
        const fielding_team_id = safeFkInt(inn.fielding_team_id);

        const inningRecord = {
          inning_id,
          match_id,
          inning_number: safeInt(inn.number, 1)!,
          name: safeString(inn.name),
          short_name: safeString(inn.short_name),
          batting_team_id,
          fielding_team_id,
          runs: safeInt(inn.equations?.runs || inn.scores?.split("/")[0], 0),
          wickets: safeInt(
            inn.equations?.wickets || inn.scores?.split("/")[1],
            0
          ),
          overs: safeFloat(inn.overs || inn.equations?.overs),
          scores_full: safeString(inn.scores_full),
        };

        await prisma.match_innings.upsert({
          where: { inning_id },
          update: inningRecord,
          create: inningRecord,
        });
        insertedInningsCount++;
        ctx.inningToMatchMap.set(inning_id, match_id);

        // Batsmen Scorecards
        if (inn.batsmen) {
          for (let pos = 0; pos < inn.batsmen.length; pos++) {
            const b = inn.batsmen[pos];
            const batsman_id = safeFkInt(b.batsman_id);
            const bowler_id = safeFkInt(b.bowler_id);
            const first_fielder_id = safeFkInt(b.first_fielder_id);
            const second_fielder_id = safeFkInt(b.second_fielder_id);
            const third_fielder_id = safeFkInt(b.third_fielder_id);

            await prisma.scorecard_batsmen.create({
              data: {
                inning_id,
                match_id,
                batsman_id,
                batting_position: pos + 1,
                runs: safeInt(b.runs, 0),
                balls_faced: safeInt(b.balls_faced, 0),
                fours: safeInt(b.fours, 0),
                sixes: safeInt(b.sixes, 0),
                dot_balls: safeInt(b.run0, 0),
                strike_rate: safeFloat(b.strike_rate),
                how_out: safeString(b.how_out),
                dismissal: safeString(b.dismissal),
                bowler_id,
                first_fielder_id,
                second_fielder_id,
                third_fielder_id,
              },
            });
            insertedBatsmenCount++;
          }
        }

        // Bowlers Scorecards
        if (inn.bowlers) {
          for (const bw of inn.bowlers) {
            const bowler_id = safeFkInt(bw.bowler_id);
            await prisma.scorecard_bowlers.create({
              data: {
                inning_id,
                match_id,
                bowler_id,
                overs: safeFloat(bw.overs),
                maidens: safeInt(bw.maidens, 0),
                runs_conceded: safeInt(bw.runs_conceded, 0),
                wickets: safeInt(bw.wickets, 0),
                noballs: safeInt(bw.noballs, 0),
                wides: safeInt(bw.wides, 0),
                economy: safeFloat(bw.econ),
                dot_balls: safeInt(bw.run0, 0),
              },
            });
            insertedBowlersCount++;
          }
        }
      }
    }
  }

  console.log(`   ✅ Ingested ${insertedMatchesCount} matches.`);
  console.log(`   ✅ Ingested ${insertedInningsCount} innings.`);
  console.log(
    `   ✅ Ingested ${insertedBatsmenCount} batsman scorecard lines.`
  );
  console.log(`   ✅ Ingested ${insertedBowlersCount} bowler scorecard lines.`);
}
