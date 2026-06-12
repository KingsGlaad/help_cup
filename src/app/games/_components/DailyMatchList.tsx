/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useMemo } from "react";
import { Game, Team } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Clock, Trophy } from "lucide-react";

interface DailyMatchListProps {
  games: Game[];
  teamsMap: Record<string, Team>;
  title?: string;
}

const phaseMap: Record<string, string> = {
  group1: "Rodada 1",
  group2: "Rodada 2",
  group3: "Rodada 3",
  group: "Fase de Grupos",
  r32: "16 Avos de Final",
  r16: "Oitavas de Final",
  qf: "Quartas de Final",
  sf: "Semifinal",
  third: "Terceiro Lugar",
  final: "Final",
};

function getPhaseKey(round: string): string {
  if (!round) return "group1";
  const r = round.toLowerCase().trim();
  if (r === "1" || r.includes("rodada 1") || r.includes("round 1"))
    return "group1";
  if (r === "2" || r.includes("rodada 2") || r.includes("round 2"))
    return "group2";
  if (r === "3" || r.includes("rodada 3") || r.includes("round 3"))
    return "group3";
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

export function DailyMatchList({
  games,
  teamsMap,
  title = "Calendário de Jogos",
}: DailyMatchListProps) {
  const gamesByDate = useMemo(() => {
    const groups: Record<string, Game[]> = {};
    if (!games) return groups;

    games.forEach((game) => {
      const dateKey = game.match_date || "TBD";
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(game);
    });

    Object.keys(groups).forEach((dateKey) => {
      groups[dateKey].sort((a, b) => {
        const timeA = a.match_time || "00:00";
        const timeB = b.match_time || "00:00";
        return timeA.localeCompare(timeB);
      });
    });

    return groups;
  }, [games]);

  if (!games || games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-card text-card-foreground rounded-2xl border shadow-sm">
        <h3 className="font-bold text-xl mb-2">Nenhum jogo disponível</h3>
        <p className="text-muted-foreground text-lg">
          Não há partidas cadastradas no momento.
        </p>
      </div>
    );
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

  const formatDisplayDate = (dateString: string) => {
    if (dateString === "TBD") return "A definir";
    try {
      const [year, month, day] = dateString.split("-");
      if (day && month && year) {
        return `${day}/${month}/${year}`;
      }
      return dateString;
    } catch (e) {
      return dateString;
    }
  };

  const isLive = (game: Game) => game.match_live === "1";

  // Ordenar as datas cronologicamente
  const sortedDates = Object.keys(gamesByDate).sort((a, b) => {
    if (a === "TBD") return 1;
    if (b === "TBD") return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="bg-transparent">
      <div className="pb-12 space-y-12">
        {sortedDates.map((dateKey) => {
          const displayDate = formatDisplayDate(dateKey);
          const dateGames = gamesByDate[dateKey];

          return (
            <div key={dateKey} className="space-y-6">
              {/* Cabeçalho do Dia */}
              <div className="sticky top-0 z-10 flex items-center gap-4 bg-background/90 backdrop-blur-xl py-4 px-2 border-b-2 border-primary/20">
                <div className="bg-primary/15 p-3 rounded-xl text-primary shadow-sm">
                  <Calendar className="w-6 h-6" />
                </div>
                <h2 className="font-extrabold text-2xl md:text-3xl text-foreground tracking-tight">
                  {displayDate}
                </h2>
                <div className="ml-auto flex items-center">
                  <span className="text-sm font-bold text-primary-foreground bg-primary px-4 py-1.5 rounded-full shadow-md">
                    {dateGames.length}{" "}
                    {dateGames.length === 1 ? "jogo" : "jogos"}
                  </span>
                </div>
              </div>

              {/* Grid de Jogos (Cards Maiores e Espaçados) */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 px-2">
                {dateGames.map((game) => {
                  const homeTeam = teamsMap[game.match_hometeam_id];
                  const awayTeam = teamsMap[game.match_awayteam_id];
                  const live = isLive(game);
                  const phaseName =
                    phaseMap[getPhaseKey(game.match_round)] || game.match_round;

                  return (
                    <div
                      key={game.match_id}
                      className={`flex flex-col p-6 md:p-8 rounded-[2rem] border-2 ${
                        live
                          ? "bg-green-500/10 border-green-500/50 shadow-[0_8px_30px_rgba(34,197,94,0.2)]"
                          : "bg-card border-border/60 shadow-sm"
                      } transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] group relative overflow-hidden`}
                    >
                      <Link
                        href={`/game/${game.match_id}`}
                        className="absolute inset-0 z-0"
                        aria-label="Ver detalhes da partida"
                      />
                      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                      {/* Top Info Bar: Phase, Time, Stadium */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-sm text-muted-foreground uppercase tracking-widest font-bold mb-6">
                        <div className="flex gap-2">
                          <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                            <Trophy className="w-4 h-4" />
                            {phaseName}
                          </span>
                          <span
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${live ? "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30" : "bg-muted/50 border-transparent"}`}
                          >
                            <Clock className="w-4 h-4" />
                            {formatTime(game)}
                          </span>
                        </div>

                        <span className="flex items-center gap-2 max-w-[60%] sm:max-w-full justify-end text-right bg-muted/30 px-3 py-1.5 rounded-lg ml-auto">
                          <MapPin className="w-4 h-4 text-primary/70 shrink-0" />
                          <span className="line-clamp-2 wrap-break-word text-right">
                            {game.match_stadium || "Estádio a definir"}
                          </span>
                        </span>
                      </div>

                      {/* Main Match Info */}
                      <div className="flex items-center justify-between w-full mt-4">
                        {/* Home Team */}
                        <Link
                          href={`/teams/${game.match_hometeam_id}`}
                          className="flex flex-col items-center justify-center flex-1 gap-4 z-10 relative hover:opacity-80 transition-opacity"
                        >
                          {homeTeam?.team_badge || game.team_home_badge ? (
                            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shadow-lg shrink-0 bg-background border-4 border-muted/50 p-2 group-hover:scale-105 transition-transform duration-300">
                              <Image
                                src={
                                  homeTeam?.team_badge ||
                                  game.team_home_badge ||
                                  ""
                                }
                                alt="flag"
                                fill
                                sizes="96px"
                                className="object-contain p-1"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-muted rounded-full shrink-0 border-4 border-border" />
                          )}
                          <span className="font-black text-lg md:text-xl tracking-wider text-center w-full text-balance wrap-break-word px-2 leading-tight">
                            {homeTeam?.team_name ||
                              game.match_hometeam_name ||
                              "Time 1"}
                          </span>
                        </Link>

                        {/* Score Display */}
                        <div className="flex flex-col items-center justify-center px-4 shrink-0 z-10 relative pointer-events-none">
                          <div className="flex items-center justify-center gap-4 font-black text-4xl md:text-5xl bg-background/50 backdrop-blur px-6 py-4 rounded-2xl shadow-inner border border-border">
                            <span
                              className={
                                game.match_hometeam_score >
                                game.match_awayteam_score
                                  ? "text-primary"
                                  : ""
                              }
                            >
                              {game.match_status !== ""
                                ? game.match_hometeam_score || "0"
                                : "-"}
                            </span>
                            <span className="text-muted-foreground/30 text-3xl font-medium">
                              x
                            </span>
                            <span
                              className={
                                game.match_awayteam_score >
                                game.match_hometeam_score
                                  ? "text-primary"
                                  : ""
                              }
                            >
                              {game.match_status !== ""
                                ? game.match_awayteam_score || "0"
                                : "-"}
                            </span>
                          </div>

                          {/* Halftime Score */}
                          {(game.match_hometeam_halftime_score ||
                            game.match_awayteam_halftime_score) && (
                            <span className="text-xs md:text-sm mt-3 font-bold text-muted-foreground uppercase tracking-widest text-center bg-muted/60 px-3 py-1 rounded-md">
                              HT: {game.match_hometeam_halftime_score || "0"} -{" "}
                              {game.match_awayteam_halftime_score || "0"}
                            </span>
                          )}

                          {/* Extra Time / Penalties */}
                          {!game.match_round
                            ?.toLowerCase()
                            .includes("group") && (
                            <div className="flex flex-col items-center gap-1.5 mt-2">
                              {game.match_hometeam_extra_score && (
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">
                                  ET: {game.match_hometeam_extra_score} -{" "}
                                  {game.match_awayteam_extra_score}
                                </span>
                              )}
                              {game.match_hometeam_penalty_score && (
                                <span className="text-xs font-black text-primary uppercase tracking-widest text-center bg-primary/10 px-2 py-1 rounded-md border border-primary/20">
                                  PEN: {game.match_hometeam_penalty_score} -{" "}
                                  {game.match_awayteam_penalty_score}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Away Team */}
                        <Link
                          href={`/teams/${game.match_awayteam_id}`}
                          className="flex flex-col items-center justify-center flex-1 gap-4 z-10 relative hover:opacity-80 transition-opacity"
                        >
                          {awayTeam?.team_badge || game.team_away_badge ? (
                            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shadow-lg shrink-0 bg-background border-4 border-muted/50 p-2 group-hover:scale-105 transition-transform duration-300">
                              <Image
                                src={
                                  awayTeam?.team_badge ||
                                  game.team_away_badge ||
                                  ""
                                }
                                alt="flag"
                                fill
                                sizes="96px"
                                className="object-contain p-1"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-muted rounded-full shrink-0 border-4 border-border" />
                          )}
                          <span className="font-black text-lg md:text-xl tracking-wider text-center w-full text-balance wrap-break-word px-2 leading-tight">
                            {awayTeam?.team_name ||
                              game.match_awayteam_name ||
                              "Time 2"}
                          </span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
