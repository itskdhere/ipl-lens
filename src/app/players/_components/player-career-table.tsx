"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconChartLine } from "@tabler/icons-react";

interface CareerStat {
  id: string | number;
  format_str: string;
  stat_type: string;
  matches?: number | null;
  innings?: number | null;
  runs?: number | null;
  balls?: number | null;
  highest_score?: string | null;
  average?: number | string | null;
  strike_rate?: number | string | null;
  hundreds?: number | null;
  fifties?: number | null;
  fours?: number | null;
  sixes?: number | null;
  wickets?: number | null;
  best_bowling?: string | null;
  economy?: number | string | null;
  four_wickets?: number | null;
  five_wickets?: number | null;
}

interface PlayerCareerTableProps {
  careerStats: CareerStat[];
}

const FORMAT_NAMES: Record<string, string> = {
  firstclass: "First Class",
  lista: "List A",
  t10: "T10",
  t20: "T20",
  t20i: "T20I",
  test: "Test",
  odi: "ODI",
};

function formatFormatName(str: string): string {
  const key = str.toLowerCase().trim();
  return FORMAT_NAMES[key] || str.toUpperCase();
}

export function PlayerCareerTable({ careerStats }: PlayerCareerTableProps) {
  const [activeTab, setActiveTab] = useState<"batting" | "bowling">("batting");

  const battingStats = careerStats.filter(
    (s) =>
      s.stat_type.toLowerCase() === "batting" &&
      ((s.matches ?? 0) > 0 || (s.innings ?? 0) > 0 || (s.runs ?? 0) > 0)
  );
  const bowlingStats = careerStats.filter(
    (s) =>
      s.stat_type.toLowerCase() === "bowling" &&
      ((s.matches ?? 0) > 0 || (s.innings ?? 0) > 0 || (s.wickets ?? 0) > 0)
  );

  return (
    <Card className="border-border/80 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-lg font-heading font-bold flex items-center gap-2">
            <IconChartLine className="h-5 w-5 text-primary" />
            Multi-Format Career Records
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Historical career statistics across major international and domestic
            formats
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "batting" | "bowling")}
        >
          <TabsList className="grid grid-cols-2 w-48">
            <TabsTrigger value="batting" className="text-xs font-medium">
              Batting
            </TabsTrigger>
            <TabsTrigger value="bowling" className="text-xs font-medium">
              Bowling
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="px-0">
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="batting" className="m-0">
            {battingStats.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No batting career statistics available.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-mono text-xs uppercase font-bold pl-6 w-36 sm:w-44">
                        Format
                      </TableHead>
                      <TableHead className="text-right font-mono text-xs uppercase font-bold">
                        Mat
                      </TableHead>
                      <TableHead className="text-right font-mono text-xs uppercase font-bold">
                        Inns
                      </TableHead>
                      <TableHead className="text-right font-mono text-xs uppercase font-bold">
                        Runs
                      </TableHead>
                      <TableHead className="text-right font-mono text-xs uppercase font-bold">
                        HS
                      </TableHead>
                      <TableHead className="text-right font-mono text-xs uppercase font-bold">
                        Avg
                      </TableHead>
                      <TableHead className="text-right font-mono text-xs uppercase font-bold">
                        SR
                      </TableHead>
                      <TableHead className="text-right font-mono text-xs uppercase font-bold">
                        100s
                      </TableHead>
                      <TableHead className="text-right font-mono text-xs uppercase font-bold">
                        50s
                      </TableHead>
                      <TableHead className="text-right font-mono text-xs uppercase font-bold">
                        4s
                      </TableHead>
                      <TableHead className="text-right font-mono text-xs uppercase font-bold pr-6">
                        6s
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {battingStats.map((stat, idx) => (
                      <TableRow
                        key={idx}
                        className="hover:bg-muted/40 transition-colors"
                      >
                        <TableCell className="font-semibold text-xs font-mono text-primary pl-6">
                          {formatFormatName(stat.format_str)}
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono">
                          {stat.matches ?? "-"}
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono">
                          {stat.innings ?? "-"}
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono font-bold text-foreground">
                          {stat.runs ?? "-"}
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono">
                          {stat.highest_score ?? "-"}
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono">
                          {stat.average != null
                            ? Number(stat.average).toFixed(2)
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono">
                          {stat.strike_rate != null
                            ? Number(stat.strike_rate).toFixed(2)
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono">
                          {stat.hundreds ?? 0}
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono">
                          {stat.fifties ?? 0}
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono text-emerald-600 dark:text-emerald-400">
                          {stat.fours ?? 0}
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono text-purple-600 dark:text-purple-400 pr-6">
                          {stat.sixes ?? 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bowling" className="m-0">
            {bowlingStats.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No bowling career statistics available.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-mono text-xs uppercase font-bold pl-6 w-36 sm:w-44">
                        Format
                      </TableHead>
                      <TableHead className="text-right font-mono text-xs uppercase font-bold">
                        Mat
                      </TableHead>
                      <TableHead className="text-right font-mono text-xs uppercase font-bold">
                        Inns
                      </TableHead>
                      <TableHead className="text-right font-mono text-xs uppercase font-bold">
                        Wkts
                      </TableHead>
                      <TableHead className="text-right font-mono text-xs uppercase font-bold">
                        BBI
                      </TableHead>
                      <TableHead className="text-right font-mono text-xs uppercase font-bold">
                        Econ
                      </TableHead>
                      <TableHead className="text-right font-mono text-xs uppercase font-bold">
                        Avg
                      </TableHead>
                      <TableHead className="text-right font-mono text-xs uppercase font-bold">
                        4w
                      </TableHead>
                      <TableHead className="text-right font-mono text-xs uppercase font-bold pr-6">
                        5w
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bowlingStats.map((stat, idx) => (
                      <TableRow
                        key={idx}
                        className="hover:bg-muted/40 transition-colors"
                      >
                        <TableCell className="font-semibold text-xs font-mono text-primary pl-6">
                          {formatFormatName(stat.format_str)}
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono">
                          {stat.matches ?? "-"}
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono">
                          {stat.innings ?? "-"}
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono font-bold text-foreground">
                          {stat.wickets ?? "-"}
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono">
                          {stat.best_bowling ?? "-"}
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono">
                          {stat.economy != null
                            ? Number(stat.economy).toFixed(2)
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono">
                          {stat.average != null
                            ? Number(stat.average).toFixed(2)
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono">
                          {stat.four_wickets ?? 0}
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono pr-6">
                          {stat.five_wickets ?? 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
