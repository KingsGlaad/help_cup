import React, { useMemo } from "react";
import { Game, Team } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Calendar, MapPin } from "lucide-react";

interface MatchListProps {
  games: Game[];
  teamsMap: Record<string, Team>;
  title?: string;
}

const phaseMap: Record<string, string> = {
  group1: "Rodada 1",
  group2: "Rodada 2",
  group3: "Rodada 3",
  group: "Fase de Grupos",
  r32: "16 Avos",
  r16: "Oitavas",
  qf: "Quartas",
  sf: "Semifinais",
  third: "Terceiro",
  final: "Final",
};

const phaseOrder = [
  "group1",
  "group2",
  "group3",
  "group",
  "r32",
  "r16",
  "qf",
  "sf",
  "third",
  "final",
];

function getPhaseKey(round: string): string {
  if (!round) return "group1";
  const r = round.toLowerCase().trim();
  if (r === "1" || r.includes("rodada 1") || r.includes("round 1")) return "group1";
  if (r === "2" || r.includes("rodada 2") || r.includes("round 2")) return "group2";
  if (r === "3" || r.includes("rodada 3") || r.includes("round 3")) return "group3";
  if (r.includes("group") || r.includes("grupo")) return "group";
  if (r.includes("32")) return "r32";
  if (r.includes("16") || r.includes("oitava")) return "r16";
  if (r.includes("quarter") || r.includes("quarta")) return "qf";
  if (r.includes("semi")) return "sf";
  if (r.includes("3rd") || r.includes("third") || r.includes("terceiro"))
    return "third";
  if (r.includes("final")) return "final";
  return "group";
}

export function MatchList({
  games,
  teamsMap,
  title = "Todos os Jogos",
}: MatchListProps) {
  const groupedGames = useMemo(() => {
    const groups: Record<string, Game[]> = {};
    if (!games) return groups;
    games.forEach((game) => {
      const type = getPhaseKey(game.match_round);
      if (!groups[type]) groups[type] = [];
      groups[type].push(game);
    });
    return groups;
  }, [games]);

  if (!games || games.length === 0) {
    return null;
  }

  const formatTime = (game: Game) => {
    if (game.match_status === "Finished") return "Encerrado";
    if (game.match_status === "Half Time") return "Intervalo";
    if (game.match_live === "1") {
      if (game.match_status && game.match_status !== "") {
        return `${isNaN(Number(game.match_status)) ? game.match_status : `${game.match_status}'`}`;
      }
      return "Ao Vivo";
    }
    if (game.match_time) return game.match_time;
    return "";
  };

  const formatFullDate = (game: Game) => {
    if (game.match_date) {
      try {
        const [year, month, day] = game.match_date.split("-");
        if (day && month && year) {
          return `${day}/${month}/${year}`;
        }
        return game.match_date;
      } catch (e) {
        return game.match_date;
      }
    }
    return "A definir";
  };

  const isLive = (game: Game) => game.match_live === "1";

  const phases = Object.keys(groupedGames).sort(
    (a, b) => phaseOrder.indexOf(a) - phaseOrder.indexOf(b),
  );
  const defaultTab = phases[0] || "";

  return (
    <div className="bg-card text-card-foreground rounded-xl border shadow-sm overflow-hidden h-full flex flex-col">
      <div className="bg-muted/50 px-4 py-3 border-b flex justify-between items-center">
        <h3 className="font-bold text-lg">{title}</h3>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
          {games.length} jogos
        </span>
      </div>

      <div className="flex-1 p-2 flex flex-col min-h-0 overflow-hidden">
        <Tabs defaultValue={defaultTab} className="flex flex-col h-full">
          <TabsList className="w-full flex flex-wrap justify-center hide-scrollbar mb-4 p-1.5 bg-muted/50 h-auto shrink-0 gap-1 rounded-xl">
            {phases.map((phase) => (
              <TabsTrigger
                key={phase}
                value={phase}
                className="text-sm sm:text-base font-semibold px-4 py-2 flex-1 whitespace-nowrap"
              >
                {phaseMap[phase] || phase}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-y-auto pr-1">
            {phases.map((phase) => (
              <TabsContent
                key={phase}
                value={phase}
                className="m-0 space-y-2 focus-visible:outline-none focus-visible:ring-0"
              >
                {groupedGames[phase].map((game) => {
                  const homeTeam = teamsMap[game.match_hometeam_id];
                  const awayTeam = teamsMap[game.match_awayteam_id];
                  const live = isLive(game);

                  return (
                    <Link
                      href={`/game/${game.match_id}`}
                      key={game.match_id}
                      className={`flex flex-col gap-2 py-3 px-4 rounded-xl border ${
                        live
                          ? "bg-green-500/10 border-green-500/30 hover:bg-green-500/20"
                          : "bg-background hover:bg-muted/60"
                      } transition-all hover:shadow-md cursor-pointer group`}
                    >
                      <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1 bg-muted/30 px-2 py-1 rounded-sm">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-primary/70" />
                          {formatFullDate(game)}
                        </span>
                        <span className="flex items-center gap-1.5 truncate max-w-[50%] justify-end">
                          <MapPin className="w-3 h-3 text-primary/70 shrink-0" />
                          <span className="truncate">
                            {game.match_stadium || "Estádio a definir"}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between w-full">
                        {/* Home Team */}
                        <div className="flex flex-1 items-center justify-end gap-3 text-right">
                          {homeTeam?.team_badge || game.team_home_badge ? (
                            <div className="relative w-8 h-6 rounded-sm overflow-hidden shadow-sm shrink-0">
                              <Image
                                src={
                                  homeTeam?.team_badge ||
                                  game.team_home_badge ||
                                  ""
                                }
                                alt="flag"
                                fill
                                sizes="32px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-8 h-6 bg-muted rounded-sm shrink-0" />
                          )}
                          <span className="font-black text-sm tracking-widest uppercase">
                            {homeTeam?.team_name
                              ?.substring(0, 3)
                              .toUpperCase() ||
                              game.match_hometeam_name
                                ?.substring(0, 3)
                                .toUpperCase() ||
                              "T1"}
                          </span>
                        </div>

                        {/* Score / Time */}
                        <div className="flex flex-col items-center justify-center w-24 mx-2">
                          <div className="flex items-center justify-center gap-2 font-black text-lg bg-muted/80 px-3 py-1 rounded-lg w-full">
                            <span>{game.match_hometeam_score || "0"}</span>
                            <span className="text-muted-foreground/60 text-sm font-medium">
                              -
                            </span>
                            <span>{game.match_awayteam_score || "0"}</span>
                          </div>
                          {game.match_hometeam_halftime_score ||
                          game.match_awayteam_halftime_score ? (
                            <span className="text-[10px] mt-1 font-semibold text-muted-foreground uppercase tracking-wider text-center">
                              HT: {game.match_hometeam_halftime_score || "0"} -{" "}
                              {game.match_awayteam_halftime_score || "0"}
                            </span>
                          ) : null}

                          {/* Extra Time / Penalties for Knockouts */}
                          {!game.match_round?.toLowerCase().includes("group") && (
                            <>
                              {game.match_hometeam_extra_score && (
                                <span className="text-[10px] mt-0.5 font-semibold text-muted-foreground uppercase tracking-wider text-center">
                                  ET: {game.match_hometeam_extra_score} - {game.match_awayteam_extra_score}
                                </span>
                              )}
                              {game.match_hometeam_penalty_score && (
                                <span className="text-[10px] mt-0.5 font-bold text-primary uppercase tracking-wider text-center">
                                  PEN: {game.match_hometeam_penalty_score} - {game.match_awayteam_penalty_score}
                                </span>
                              )}
                            </>
                          )}

                          <span
                            className={`text-lg sm:text-sm mt-1.5 font-bold uppercase tracking-wider ${
                              game.match_status === "Half Time"
                                ? "text-amber-500 animate-pulse"
                                : live
                                  ? "text-green-600 animate-pulse"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {formatTime(game)}
                          </span>
                        </div>

                        {/* Away Team */}
                        <div className="flex flex-1 items-center justify-start gap-3">
                          <span className="font-black text-sm tracking-widest uppercase">
                            {awayTeam?.team_name
                              ?.substring(0, 3)
                              .toUpperCase() ||
                              game.match_awayteam_name
                                ?.substring(0, 3)
                                .toUpperCase() ||
                              "T2"}
                          </span>
                          {awayTeam?.team_badge || game.team_away_badge ? (
                            <div className="relative w-8 h-6 rounded-sm overflow-hidden shadow-sm shrink-0">
                              <Image
                                src={
                                  awayTeam?.team_badge ||
                                  game.team_away_badge ||
                                  ""
                                }
                                alt="flag"
                                fill
                                sizes="32px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-8 h-6 bg-muted rounded-sm shrink-0" />
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
