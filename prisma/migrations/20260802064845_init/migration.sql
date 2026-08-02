-- CreateTable
CREATE TABLE "ball_commentary" (
    "event_id" BIGINT NOT NULL,
    "match_id" INTEGER,
    "inning_id" INTEGER,
    "over_number" INTEGER NOT NULL,
    "ball_number" INTEGER NOT NULL,
    "batsman_id" INTEGER,
    "bowler_id" INTEGER,
    "total_runs" INTEGER DEFAULT 0,
    "bat_runs" INTEGER DEFAULT 0,
    "noball_runs" INTEGER DEFAULT 0,
    "wide_runs" INTEGER DEFAULT 0,
    "bye_runs" INTEGER DEFAULT 0,
    "legbye_runs" INTEGER DEFAULT 0,
    "is_four" BOOLEAN DEFAULT false,
    "is_six" BOOLEAN DEFAULT false,
    "is_noball" BOOLEAN DEFAULT false,
    "is_wide" BOOLEAN DEFAULT false,
    "is_wicket" BOOLEAN DEFAULT false,
    "wicket_batsman_id" INTEGER,
    "how_out" TEXT,
    "commentary_text" TEXT,
    "event_timestamp" BIGINT,

    CONSTRAINT "ball_commentary_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "competitions" (
    "cid" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "abbr" VARCHAR(50),
    "type" VARCHAR(50),
    "category" VARCHAR(50),
    "match_format" VARCHAR(50),
    "season" VARCHAR(20),
    "status" VARCHAR(50),
    "datestart" DATE,
    "dateend" DATE,
    "country" VARCHAR(10),
    "total_matches" INTEGER,
    "total_rounds" INTEGER,
    "total_teams" INTEGER,

    CONSTRAINT "competitions_pkey" PRIMARY KEY ("cid")
);

-- CreateTable
CREATE TABLE "match_innings" (
    "inning_id" INTEGER NOT NULL,
    "match_id" INTEGER,
    "inning_number" INTEGER NOT NULL,
    "name" VARCHAR(100),
    "short_name" VARCHAR(50),
    "batting_team_id" INTEGER,
    "fielding_team_id" INTEGER,
    "runs" INTEGER DEFAULT 0,
    "wickets" INTEGER DEFAULT 0,
    "overs" DECIMAL(4,1),
    "scores_full" VARCHAR(100),

    CONSTRAINT "match_innings_pkey" PRIMARY KEY ("inning_id")
);

-- CreateTable
CREATE TABLE "matches" (
    "match_id" INTEGER NOT NULL,
    "competition_id" INTEGER,
    "title" VARCHAR(255),
    "short_title" VARCHAR(100),
    "subtitle" VARCHAR(100),
    "match_number" VARCHAR(20),
    "format_str" VARCHAR(20),
    "status_id" INTEGER,
    "status_str" VARCHAR(50),
    "status_note" TEXT,
    "teama_id" INTEGER,
    "teamb_id" INTEGER,
    "teama_score" VARCHAR(50),
    "teamb_score" VARCHAR(50),
    "teama_overs" VARCHAR(20),
    "teamb_overs" VARCHAR(20),
    "date_start" TIMESTAMPTZ(6),
    "date_end" TIMESTAMPTZ(6),
    "date_start_ist" TIMESTAMP(6),
    "venue_id" INTEGER,
    "umpires" TEXT,
    "referee" TEXT,
    "result" TEXT,
    "result_type" INTEGER,
    "win_margin" VARCHAR(50),
    "winning_team_id" INTEGER,
    "man_of_the_match_id" INTEGER,
    "toss_text" TEXT,
    "toss_winner_id" INTEGER,
    "toss_decision" INTEGER,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("match_id")
);

-- CreateTable
CREATE TABLE "player_career_stats" (
    "id" BIGSERIAL NOT NULL,
    "player_id" INTEGER,
    "format_str" VARCHAR(20) NOT NULL,
    "stat_type" VARCHAR(20) NOT NULL,
    "matches" INTEGER DEFAULT 0,
    "innings" INTEGER DEFAULT 0,
    "runs" INTEGER DEFAULT 0,
    "balls" INTEGER DEFAULT 0,
    "highest_score" VARCHAR(20),
    "average" DECIMAL(6,2),
    "strike_rate" DECIMAL(6,2),
    "hundreds" INTEGER DEFAULT 0,
    "fifties" INTEGER DEFAULT 0,
    "fours" INTEGER DEFAULT 0,
    "sixes" INTEGER DEFAULT 0,
    "wickets" INTEGER DEFAULT 0,
    "best_bowling" VARCHAR(20),
    "economy" DECIMAL(5,2),
    "four_wickets" INTEGER DEFAULT 0,
    "five_wickets" INTEGER DEFAULT 0,

    CONSTRAINT "player_career_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "player_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "short_name" VARCHAR(100),
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "middle_name" VARCHAR(100),
    "birthdate" DATE,
    "birthplace" TEXT,
    "country" VARCHAR(10),
    "nationality" VARCHAR(100),
    "playing_role" VARCHAR(50),
    "batting_style" VARCHAR(100),
    "bowling_style" VARCHAR(100),
    "fielding_position" VARCHAR(100),
    "logo_url" TEXT,
    "thumb_url" TEXT,
    "facebook_profile" TEXT,
    "twitter_profile" TEXT,
    "instagram_profile" TEXT,

    CONSTRAINT "players_pkey" PRIMARY KEY ("player_id")
);

-- CreateTable
CREATE TABLE "scorecard_batsmen" (
    "id" BIGSERIAL NOT NULL,
    "inning_id" INTEGER,
    "match_id" INTEGER,
    "batsman_id" INTEGER,
    "batting_position" INTEGER,
    "runs" INTEGER DEFAULT 0,
    "balls_faced" INTEGER DEFAULT 0,
    "fours" INTEGER DEFAULT 0,
    "sixes" INTEGER DEFAULT 0,
    "dot_balls" INTEGER DEFAULT 0,
    "strike_rate" DECIMAL(6,2),
    "how_out" TEXT,
    "dismissal" VARCHAR(50),
    "bowler_id" INTEGER,
    "first_fielder_id" INTEGER,
    "second_fielder_id" INTEGER,
    "third_fielder_id" INTEGER,

    CONSTRAINT "scorecard_batsmen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scorecard_bowlers" (
    "id" BIGSERIAL NOT NULL,
    "inning_id" INTEGER,
    "match_id" INTEGER,
    "bowler_id" INTEGER,
    "overs" DECIMAL(4,1),
    "maidens" INTEGER DEFAULT 0,
    "runs_conceded" INTEGER DEFAULT 0,
    "wickets" INTEGER DEFAULT 0,
    "noballs" INTEGER DEFAULT 0,
    "wides" INTEGER DEFAULT 0,
    "economy" DECIMAL(5,2),
    "dot_balls" INTEGER DEFAULT 0,

    CONSTRAINT "scorecard_bowlers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "standings" (
    "id" SERIAL NOT NULL,
    "competition_id" INTEGER,
    "team_id" INTEGER,
    "played" INTEGER DEFAULT 0,
    "win" INTEGER DEFAULT 0,
    "loss" INTEGER DEFAULT 0,
    "draw_nr" INTEGER DEFAULT 0,
    "points" INTEGER DEFAULT 0,
    "net_rr" DECIMAL(6,3),
    "last_five_form" VARCHAR(50),

    CONSTRAINT "standings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_squads" (
    "squad_id" BIGSERIAL NOT NULL,
    "team_id" INTEGER,
    "player_id" INTEGER,
    "season" VARCHAR(20) DEFAULT '2022',
    "playing_role" VARCHAR(50),
    "fantasy_player_rating" DECIMAL(4,2),

    CONSTRAINT "team_squads_pkey" PRIMARY KEY ("squad_id")
);

-- CreateTable
CREATE TABLE "teams" (
    "team_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "abbr" VARCHAR(20) NOT NULL,
    "alt_name" VARCHAR(255),
    "type" VARCHAR(50),
    "thumb_url" TEXT,
    "logo_url" TEXT,
    "country" VARCHAR(10),
    "sex" VARCHAR(10),

    CONSTRAINT "teams_pkey" PRIMARY KEY ("team_id")
);

-- CreateTable
CREATE TABLE "venues" (
    "venue_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "location" VARCHAR(255),
    "country" VARCHAR(100),
    "timezone" VARCHAR(50),

    CONSTRAINT "venues_pkey" PRIMARY KEY ("venue_id")
);

-- CreateTable
CREATE TABLE "wagon_wheel_shots" (
    "shot_id" BIGSERIAL NOT NULL,
    "match_id" INTEGER,
    "inning_id" INTEGER,
    "batsman_id" INTEGER,
    "bowler_id" INTEGER,
    "over_number" INTEGER NOT NULL,
    "unique_over" DECIMAL(4,1) NOT NULL,
    "bat_runs" INTEGER DEFAULT 0,
    "team_runs" INTEGER DEFAULT 0,
    "coord_x" INTEGER NOT NULL,
    "coord_y" INTEGER NOT NULL,
    "zone_id" INTEGER NOT NULL,
    "zone_name" VARCHAR(50),
    "event_name" VARCHAR(50),

    CONSTRAINT "wagon_wheel_shots_pkey" PRIMARY KEY ("shot_id")
);

-- CreateIndex
CREATE INDEX "idx_commentary_match_inning" ON "ball_commentary"("match_id", "inning_id");

-- CreateIndex
CREATE INDEX "idx_commentary_matchup" ON "ball_commentary"("batsman_id", "bowler_id");

-- CreateIndex
CREATE INDEX "idx_commentary_timeline" ON "ball_commentary"("match_id", "inning_id", "over_number", "ball_number");

-- CreateIndex
CREATE UNIQUE INDEX "uq_player_format_stat" ON "player_career_stats"("player_id", "format_str", "stat_type");

-- CreateIndex
CREATE INDEX "idx_scorecard_bat_match" ON "scorecard_batsmen"("match_id", "batsman_id");

-- CreateIndex
CREATE INDEX "idx_scorecard_bowl_match" ON "scorecard_bowlers"("match_id", "bowler_id");

-- CreateIndex
CREATE INDEX "idx_squads_player" ON "team_squads"("player_id");

-- CreateIndex
CREATE INDEX "idx_squads_team" ON "team_squads"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_team_player_season" ON "team_squads"("team_id", "player_id", "season");

-- CreateIndex
CREATE INDEX "idx_wagon_wheel_coords" ON "wagon_wheel_shots"("coord_x", "coord_y");

-- CreateIndex
CREATE INDEX "idx_wagon_wheel_match" ON "wagon_wheel_shots"("match_id", "batsman_id");

-- CreateIndex
CREATE INDEX "idx_wagon_wheel_player_zone" ON "wagon_wheel_shots"("batsman_id", "zone_id");

-- AddForeignKey
ALTER TABLE "ball_commentary" ADD CONSTRAINT "ball_commentary_batsman_id_fkey" FOREIGN KEY ("batsman_id") REFERENCES "players"("player_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ball_commentary" ADD CONSTRAINT "ball_commentary_bowler_id_fkey" FOREIGN KEY ("bowler_id") REFERENCES "players"("player_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ball_commentary" ADD CONSTRAINT "ball_commentary_inning_id_fkey" FOREIGN KEY ("inning_id") REFERENCES "match_innings"("inning_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ball_commentary" ADD CONSTRAINT "ball_commentary_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("match_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ball_commentary" ADD CONSTRAINT "ball_commentary_wicket_batsman_id_fkey" FOREIGN KEY ("wicket_batsman_id") REFERENCES "players"("player_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "match_innings" ADD CONSTRAINT "match_innings_batting_team_id_fkey" FOREIGN KEY ("batting_team_id") REFERENCES "teams"("team_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "match_innings" ADD CONSTRAINT "match_innings_fielding_team_id_fkey" FOREIGN KEY ("fielding_team_id") REFERENCES "teams"("team_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "match_innings" ADD CONSTRAINT "match_innings_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("match_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competitions"("cid") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_man_of_the_match_id_fkey" FOREIGN KEY ("man_of_the_match_id") REFERENCES "players"("player_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_teama_id_fkey" FOREIGN KEY ("teama_id") REFERENCES "teams"("team_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_teamb_id_fkey" FOREIGN KEY ("teamb_id") REFERENCES "teams"("team_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_toss_winner_id_fkey" FOREIGN KEY ("toss_winner_id") REFERENCES "teams"("team_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("venue_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_winning_team_id_fkey" FOREIGN KEY ("winning_team_id") REFERENCES "teams"("team_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "player_career_stats" ADD CONSTRAINT "player_career_stats_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("player_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "scorecard_batsmen" ADD CONSTRAINT "scorecard_batsmen_batsman_id_fkey" FOREIGN KEY ("batsman_id") REFERENCES "players"("player_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "scorecard_batsmen" ADD CONSTRAINT "scorecard_batsmen_bowler_id_fkey" FOREIGN KEY ("bowler_id") REFERENCES "players"("player_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "scorecard_batsmen" ADD CONSTRAINT "scorecard_batsmen_first_fielder_id_fkey" FOREIGN KEY ("first_fielder_id") REFERENCES "players"("player_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "scorecard_batsmen" ADD CONSTRAINT "scorecard_batsmen_inning_id_fkey" FOREIGN KEY ("inning_id") REFERENCES "match_innings"("inning_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "scorecard_batsmen" ADD CONSTRAINT "scorecard_batsmen_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("match_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "scorecard_batsmen" ADD CONSTRAINT "scorecard_batsmen_second_fielder_id_fkey" FOREIGN KEY ("second_fielder_id") REFERENCES "players"("player_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "scorecard_batsmen" ADD CONSTRAINT "scorecard_batsmen_third_fielder_id_fkey" FOREIGN KEY ("third_fielder_id") REFERENCES "players"("player_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "scorecard_bowlers" ADD CONSTRAINT "scorecard_bowlers_bowler_id_fkey" FOREIGN KEY ("bowler_id") REFERENCES "players"("player_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "scorecard_bowlers" ADD CONSTRAINT "scorecard_bowlers_inning_id_fkey" FOREIGN KEY ("inning_id") REFERENCES "match_innings"("inning_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "scorecard_bowlers" ADD CONSTRAINT "scorecard_bowlers_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("match_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "standings" ADD CONSTRAINT "standings_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competitions"("cid") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "standings" ADD CONSTRAINT "standings_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("team_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "team_squads" ADD CONSTRAINT "team_squads_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("player_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "team_squads" ADD CONSTRAINT "team_squads_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("team_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "wagon_wheel_shots" ADD CONSTRAINT "wagon_wheel_shots_batsman_id_fkey" FOREIGN KEY ("batsman_id") REFERENCES "players"("player_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "wagon_wheel_shots" ADD CONSTRAINT "wagon_wheel_shots_bowler_id_fkey" FOREIGN KEY ("bowler_id") REFERENCES "players"("player_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "wagon_wheel_shots" ADD CONSTRAINT "wagon_wheel_shots_inning_id_fkey" FOREIGN KEY ("inning_id") REFERENCES "match_innings"("inning_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "wagon_wheel_shots" ADD CONSTRAINT "wagon_wheel_shots_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("match_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- Check Constraints
ALTER TABLE "match_innings" ADD CONSTRAINT "match_innings_inning_number_check" CHECK (inning_number IN (1, 2));
ALTER TABLE "player_career_stats" ADD CONSTRAINT "player_career_stats_stat_type_check" CHECK (stat_type IN ('batting', 'bowling'));
ALTER TABLE "wagon_wheel_shots" ADD CONSTRAINT "wagon_wheel_shots_zone_id_check" CHECK (zone_id BETWEEN 1 AND 8);

-- 1. Match Summary View
CREATE OR REPLACE VIEW vw_match_summaries AS
SELECT 
    m.match_id,
    m.match_number,
    m.title,
    c.title AS competition_name,
    v.name AS venue_name,
    v.location AS venue_city,
    ta.abbr AS teama_name,
    tb.abbr AS teamb_name,
    m.teama_score,
    m.teamb_score,
    tw.abbr AS toss_winner,
    CASE WHEN m.toss_decision = 1 THEN 'Bat' ELSE 'Bowl' END AS toss_decision_str,
    w.title AS winning_team,
    m.win_margin,
    p.title AS man_of_the_match,
    m.date_start
FROM matches m
LEFT JOIN competitions c ON m.competition_id = c.cid
LEFT JOIN venues v ON m.venue_id = v.venue_id
LEFT JOIN teams ta ON m.teama_id = ta.team_id
LEFT JOIN teams tb ON m.teamb_id = tb.team_id
LEFT JOIN teams tw ON m.toss_winner_id = tw.team_id
LEFT JOIN teams w ON m.winning_team_id = w.team_id
LEFT JOIN players p ON m.man_of_the_match_id = p.player_id;

-- 2. Head-to-Head Batsman vs Bowler Matchup View
CREATE OR REPLACE VIEW vw_batsman_matchups AS
SELECT 
    b.batsman_id,
    p_bat.title AS batsman_name,
    b.bowler_id,
    p_bowl.title AS bowler_name,
    COUNT(b.event_id) FILTER (WHERE NOT b.is_wide) AS balls_faced,
    SUM(b.bat_runs) AS total_runs,
    COUNT(b.event_id) FILTER (WHERE b.is_four) AS fours_hit,
    COUNT(b.event_id) FILTER (WHERE b.is_six) AS sixes_hit,
    COUNT(b.event_id) FILTER (WHERE b.is_wicket AND b.wicket_batsman_id = b.batsman_id) AS dismissals,
    ROUND((SUM(b.bat_runs)::NUMERIC / NULLIF(COUNT(b.event_id) FILTER (WHERE NOT b.is_wide), 0)) * 100, 2) AS strike_rate
FROM ball_commentary b
JOIN players p_bat ON b.batsman_id = p_bat.player_id
JOIN players p_bowl ON b.bowler_id = p_bowl.player_id
GROUP BY b.batsman_id, p_bat.title, b.bowler_id, p_bowl.title;

-- 3. Match Phase Performance View (Powerplay, Middle, Death Overs)
CREATE OR REPLACE VIEW vw_phase_performance AS
SELECT 
    match_id,
    inning_id,
    CASE 
        WHEN over_number BETWEEN 0 AND 5 THEN 'Powerplay (Overs 1-6)'
        WHEN over_number BETWEEN 6 AND 14 THEN 'Middle Overs (Overs 7-15)'
        ELSE 'Death Overs (Overs 16-20)'
    END AS match_phase,
    SUM(total_runs) AS phase_runs,
    COUNT(event_id) FILTER (WHERE is_wicket) AS phase_wickets,
    COUNT(event_id) FILTER (WHERE is_four) AS phase_fours,
    COUNT(event_id) FILTER (WHERE is_six) AS phase_sixes
FROM ball_commentary
GROUP BY match_id, inning_id, match_phase;

