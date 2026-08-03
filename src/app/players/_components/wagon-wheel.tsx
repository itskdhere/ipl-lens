"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconCricket, IconEye } from "@tabler/icons-react";

export interface ShotPoint {
  shot_id: number;
  match_id?: number | null;
  over_number?: number | null;
  bat_runs?: number | null;
  coord_x: number;
  coord_y: number;
  zone_id?: number | null;
  zone_name?: string | null;
  event_name?: string | null;
}

interface WagonWheelProps {
  shots: ShotPoint[];
  playerId: number;
  playerName?: string;
  onFilterMatchChange?: (matchId: string) => void;
  onFilterZoneChange?: (zoneId: string) => void;
  selectedMatchId?: string;
  selectedZoneId?: string;
}

export function WagonWheel({ shots }: WagonWheelProps) {
  const [activeShot, setActiveShot] = useState<ShotPoint | null>(null);
  const [filterRuns, setFilterRuns] = useState<string>("all");
  const [showLines, setShowLines] = useState<boolean>(true);

  const filteredShots = useMemo(() => {
    return shots.filter((shot) => {
      if (filterRuns === "6s") return shot.bat_runs === 6;
      if (filterRuns === "4s") return shot.bat_runs === 4;
      if (filterRuns === "3s") return shot.bat_runs === 3;
      if (filterRuns === "2s") return shot.bat_runs === 2;
      if (filterRuns === "1s") return shot.bat_runs === 1;
      if (filterRuns === "boundaries")
        return shot.bat_runs === 4 || shot.bat_runs === 6;
      if (filterRuns === "singles")
        return (
          shot.bat_runs === 1 || shot.bat_runs === 2 || shot.bat_runs === 3
        );
      if (filterRuns === "dots") return !shot.bat_runs || shot.bat_runs === 0;
      return true;
    });
  }, [shots, filterRuns]);

  const getShotColor = (runs?: number | null) => {
    switch (runs) {
      case 6:
        return { stroke: "#f59e0b", fill: "#fbbf24", label: "6 Runs" }; // Amber/Gold
      case 4:
        return { stroke: "#3b82f6", fill: "#60a5fa", label: "4 Runs" }; // Blue
      case 3:
        return { stroke: "#14b8a6", fill: "#2dd4bf", label: "3 Runs" }; // Teal
      case 2:
        return { stroke: "#10b981", fill: "#34d399", label: "2 Runs" }; // Emerald
      case 1:
        return { stroke: "#0284c7", fill: "#38bdf8", label: "1 Run" }; // Sky
      default:
        return { stroke: "#e11d48", fill: "#f43f5e", label: "Wicket / 0" }; // Rose
    }
  };

  const totalShots = filteredShots.length;
  const foursCount = filteredShots.filter((s) => s.bat_runs === 4).length;
  const sixesCount = filteredShots.filter((s) => s.bat_runs === 6).length;
  const totalRuns = filteredShots.reduce(
    (acc, s) => acc + (s.bat_runs || 0),
    0
  );

  return (
    <Card className="border-border/80 shadow-md h-full flex flex-col">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3">
        <div>
          <CardTitle className="text-lg font-heading font-bold flex items-center gap-2">
            <IconCricket className="h-5 w-5 text-primary" />
            2D Spatial Wagon Wheel Plotter
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Cartesian $(x, y)$ coordinate shot map rendered on 2D cricket ground
            canvas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filterRuns}
            items={[
              { value: "all", label: "All Shots" },
              { value: "boundaries", label: "Boundaries (4/6)" },
              { value: "6s", label: "6s Only" },
              { value: "4s", label: "4s Only" },
              { value: "3s", label: "3s Only" },
              { value: "2s", label: "2s Only" },
              { value: "1s", label: "1s Only" },
              { value: "singles", label: "Running (1s, 2s, 3s)" },
              { value: "dots", label: "Dot / Wicket (0)" },
            ]}
            onValueChange={(val) => {
              if (val) {
                setFilterRuns(val);
                setActiveShot(null);
              }
            }}
          >
            <SelectTrigger className="h-8 w-40 text-xs font-medium">
              <SelectValue placeholder="Run Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Shots</SelectItem>
              <SelectItem value="boundaries">Boundaries (4/6)</SelectItem>
              <SelectItem value="6s">6s Only</SelectItem>
              <SelectItem value="4s">4s Only</SelectItem>
              <SelectItem value="3s">3s Only</SelectItem>
              <SelectItem value="2s">2s Only</SelectItem>
              <SelectItem value="1s">1s Only</SelectItem>
              <SelectItem value="singles">Running (1s, 2s, 3s)</SelectItem>
              <SelectItem value="dots">Dot / Wicket (0)</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={showLines ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShowLines(!showLines)}
            className="h-8 text-xs gap-1 font-medium"
            title="Toggle Shot Lines"
          >
            <IconEye className="h-3.5 w-3.5" />
            {showLines ? "Lines On" : "Dots Only"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
        <div className="grid grid-cols-4 gap-2 sm:gap-4 p-3 rounded-none bg-muted/40 text-center font-mono text-xs">
          <div>
            <span className="text-muted-foreground block text-[10px]">
              TOTAL SHOTS
            </span>
            <span className="font-bold text-sm text-foreground">
              {totalShots}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px]">
              RUNS PLOTTED
            </span>
            <span className="font-bold text-sm text-primary">{totalRuns}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px]">
              FOURS (4s)
            </span>
            <span className="font-bold text-sm text-blue-500">
              {foursCount}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px]">
              SIXES (6s)
            </span>
            <span className="font-bold text-sm text-amber-500">
              {sixesCount}
            </span>
          </div>
        </div>

        <div className="relative flex justify-center items-center bg-radial from-emerald-950/20 via-background to-background p-6 rounded-none border border-border/60">
          <svg
            viewBox="-10 -10 380 380"
            className="w-full max-w-110 aspect-square select-none filter drop-shadow-md overflow-visible"
          >
            <defs>
              <radialGradient id="outfieldGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#052e16" stopOpacity="0.85" />
                <stop offset="70%" stopColor="#064e3b" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#022c22" stopOpacity="0.95" />
              </radialGradient>

              <linearGradient
                id="pitchGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#78350f" />
                <stop offset="50%" stopColor="#b45309" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
            </defs>

            <circle
              cx="180"
              cy="180"
              r="165"
              fill="url(#outfieldGradient)"
              stroke="#059669"
              strokeWidth="2"
            />

            <circle
              cx="180"
              cy="180"
              r="155"
              fill="none"
              stroke="#ecfdf5"
              strokeWidth="1.5"
              strokeDasharray="4 2"
              opacity="0.7"
            />

            <circle
              cx="180"
              cy="180"
              r="75"
              fill="none"
              stroke="#34d399"
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.5"
            />

            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => {
              const rad = (angle * Math.PI) / 180;
              const x2 = 180 + 155 * Math.cos(rad);
              const y2 = 180 + 155 * Math.sin(rad);
              return (
                <line
                  key={idx}
                  x1="180"
                  y1="180"
                  x2={x2}
                  y2={y2}
                  stroke="#10b981"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
              );
            })}

            <text
              x="270"
              y="300"
              fill="#9ca3af"
              fontSize="9"
              fontFamily="monospace"
              textAnchor="middle"
            >
              Fine Leg
            </text>
            <text
              x="330"
              y="185"
              fill="#9ca3af"
              fontSize="9"
              fontFamily="monospace"
              textAnchor="middle"
            >
              Square Leg
            </text>
            <text
              x="270"
              y="65"
              fill="#9ca3af"
              fontSize="9"
              fontFamily="monospace"
              textAnchor="middle"
            >
              Mid Wicket
            </text>
            <text
              x="180"
              y="30"
              fill="#9ca3af"
              fontSize="9"
              fontFamily="monospace"
              textAnchor="middle"
              fontWeight="bold"
            >
              Long On
            </text>
            <text
              x="180"
              y="348"
              fill="#9ca3af"
              fontSize="9"
              fontFamily="monospace"
              textAnchor="middle"
              fontWeight="bold"
            >
              Long Off
            </text>
            <text
              x="85"
              y="65"
              fill="#9ca3af"
              fontSize="9"
              fontFamily="monospace"
              textAnchor="middle"
            >
              Cover
            </text>
            <text
              x="30"
              y="185"
              fill="#9ca3af"
              fontSize="9"
              fontFamily="monospace"
              textAnchor="middle"
            >
              Point
            </text>
            <text
              x="85"
              y="300"
              fill="#9ca3af"
              fontSize="9"
              fontFamily="monospace"
              textAnchor="middle"
            >
              3rd Man
            </text>

            <rect
              x="173"
              y="145"
              width="14"
              height="70"
              rx="2"
              fill="url(#pitchGradient)"
              stroke="#fbbf24"
              strokeWidth="0.75"
            />

            <line
              x1="171"
              y1="155"
              x2="189"
              y2="155"
              stroke="#ffffff"
              strokeWidth="0.75"
            />
            <line
              x1="171"
              y1="205"
              x2="189"
              y2="205"
              stroke="#ffffff"
              strokeWidth="0.75"
            />

            {filteredShots.map((shot) => {
              const color = getShotColor(shot.bat_runs);
              const isSelected = activeShot?.shot_id === shot.shot_id;

              return (
                <g
                  key={shot.shot_id}
                  className="cursor-pointer group"
                  onMouseEnter={() => setActiveShot(shot)}
                >
                  {showLines && (
                    <line
                      x1="180"
                      y1="180"
                      x2={shot.coord_x}
                      y2={shot.coord_y}
                      stroke={color.stroke}
                      strokeWidth={
                        isSelected
                          ? "2.5"
                          : shot.bat_runs === 6
                            ? "2"
                            : shot.bat_runs === 4
                              ? "1.5"
                              : "1"
                      }
                      opacity={isSelected ? 1 : 0.65}
                      className="transition-all duration-150 group-hover:opacity-100"
                    />
                  )}

                  <circle
                    cx={shot.coord_x}
                    cy={shot.coord_y}
                    r={
                      isSelected
                        ? 5
                        : shot.bat_runs === 6
                          ? 4
                          : shot.bat_runs === 4
                            ? 3.5
                            : 2.5
                    }
                    fill={color.fill}
                    stroke="#000000"
                    strokeWidth={isSelected ? "1" : "0.5"}
                    className="transition-all duration-150 transform-fill origin-center group-hover:scale-125"
                  />
                </g>
              );
            })}
          </svg>

          {activeShot && (
            <div className="absolute top-4 right-4 z-10 p-3 rounded-none border border-border/80 bg-background/95 backdrop-blur-md shadow-xl text-xs max-w-xs space-y-1 font-mono">
              <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-1">
                <span className="font-bold text-foreground">
                  Shot Info #{activeShot.shot_id}
                </span>
                <Badge
                  style={{
                    backgroundColor: getShotColor(activeShot.bat_runs).fill,
                    color: "#000",
                  }}
                  className="font-bold text-[10px] px-1.5 py-0"
                >
                  {activeShot.bat_runs} RUNS
                </Badge>
              </div>
              <div className="text-[11px] text-muted-foreground space-y-0.5 pt-1">
                {activeShot.over_number && (
                  <div>
                    Over:{" "}
                    <strong className="text-foreground">
                      {activeShot.over_number}
                    </strong>
                  </div>
                )}
                {activeShot.zone_name && (
                  <div>
                    Zone:{" "}
                    <strong className="text-foreground">
                      {activeShot.zone_name}
                    </strong>
                  </div>
                )}
                {activeShot.event_name && (
                  <div>
                    Event:{" "}
                    <strong className="text-foreground">
                      {activeShot.event_name}
                    </strong>
                  </div>
                )}
                <div>
                  Coordinates:{" "}
                  <span className="text-primary font-bold">
                    ({activeShot.coord_x}, {activeShot.coord_y})
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs pt-1">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-none bg-amber-500 inline-block"></span>
            <span>6 Runs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-none bg-blue-500 inline-block"></span>
            <span>4 Runs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-none bg-teal-500 inline-block"></span>
            <span>3 Runs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-none bg-emerald-500 inline-block"></span>
            <span>2 Runs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-none bg-sky-500 inline-block"></span>
            <span>1 Run</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-none bg-rose-500 inline-block"></span>
            <span>Dot / Wicket</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
