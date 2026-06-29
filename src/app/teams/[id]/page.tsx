/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { fetcher, endpoints, Game, Team } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Trophy,
  ChevronLeft,
  User,
  Users,
} from "lucide-react";

export default function TeamPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: gamesData, isLoading: loadingGames } = useSWR<{
    games: Game[];
  }>(endpoints.games, fetcher);
  const { data: teamsData, isLoading: loadingTeams } = useSWR<{
    teams: Team[];
  }>(endpoints.teams, fetcher);

  const loading = loadingGames || loadingTeams;

  const team = Array.isArray(teamsData?.teams) ? teamsData.teams.find((t) => t.team_key === id) : undefined;
  const teamGames =
    Array.isArray(gamesData?.games) ? gamesData.games.filter(
      (g) => g.match_hometeam_id === id || g.match_awayteam_id === id,
    ) : [];

  // Ordenar cronologicamente
  const sortedGames = [...teamGames].sort((a, b) => {
    const dtA = (a.match_date || "") + (a.match_time || "00:00");
    const dtB = (b.match_date || "") + (b.match_time || "00:00");
    return dtA.localeCompare(dtB);
  });

  const upcomingGames = sortedGames.filter(
    (g) => g.match_status === "" || g.match_status === "TBD",
  );
  const pastGames = sortedGames
    .filter((g) => g.match_status !== "" && g.match_status !== "TBD")
    .reverse(); // mais recentes primeiro

  // Extrair escalação
  const lastGameWithLineup = pastGames.find((g) => {
    if (!g.lineup) return false;
    const isHome = g.match_hometeam_id === id;
    const lineupData = isHome ? g.lineup.home : g.lineup.away;
    return lineupData?.starting_lineups?.length > 0;
  });

  const baseLineup = (() => {
    if (!lastGameWithLineup?.lineup) return null;
    const isHome = lastGameWithLineup.match_hometeam_id === id;
    return isHome
      ? lastGameWithLineup.lineup.home
      : lastGameWithLineup.lineup.away;
  })();

  const renderGameList = (gamesList: Game[], emptyMsg: string) => {
    if (gamesList.length === 0)
      return <p className="text-muted-foreground text-sm italic">{emptyMsg}</p>;

    return (
      <div className="space-y-4">
        {gamesList.map((game) => {
          const isHome = game.match_hometeam_id === id;
          const opponentName = isHome
            ? game.match_awayteam_name
            : game.match_hometeam_name;
          const opponentBadge = isHome
            ? game.team_away_badge
            : game.team_home_badge;

          return (
            <Link
              key={game.match_id}
              href={`/game/${game.match_id}`}
              className="flex items-center p-4 bg-card hover:bg-accent/50 border rounded-2xl transition-all shadow-sm group hover:scale-[1.01]"
            >
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase font-bold tracking-wider">
                  <Calendar className="w-3.5 h-3.5" />
                  {game.match_date} • {game.match_time}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span
                    className={`font-bold text-lg ${game.match_status === "" ? "text-muted-foreground" : ""}`}
                  >
                    {isHome
                      ? game.match_hometeam_score || "-"
                      : game.match_awayteam_score || "-"}
                  </span>
                  <span className="text-muted-foreground/50 text-sm font-black">
                    X
                  </span>
                  <span
                    className={`font-bold text-lg ${game.match_status === "" ? "text-muted-foreground" : ""}`}
                  >
                    {isHome
                      ? game.match_awayteam_score || "-"
                      : game.match_hometeam_score || "-"}
                  </span>

                  <div className="flex items-center gap-2 ml-4">
                    {opponentBadge ? (
                      <div className="relative w-8 h-8 rounded-full overflow-hidden border shadow-sm shrink-0">
                        <Image
                          src={opponentBadge}
                          alt={opponentName || "Adversário"}
                          fill
                          sizes="32px"
                          className="object-contain p-0.5"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-muted rounded-full shrink-0 border" />
                    )}
                    <span className="font-semibold">
                      {opponentName || "A definir"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                <span className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground font-semibold uppercase tracking-widest">
                  {game.match_round}
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase tracking-widest font-bold">
                  <MapPin className="w-3 h-3 text-primary/70" />
                  {game.match_stadium
                    ? game.match_stadium.substring(0, 20) +
                      (game.match_stadium.length > 20 ? "..." : "")
                    : "A definir"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background font-sans antialiased text-foreground flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-[1200px]">
        <Link
          href="/teams"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6 font-semibold"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Seleções
        </Link>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground animate-pulse font-medium">
              Carregando dados da seleção...
            </p>
          </div>
        ) : team ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header da Seleção */}
            <div className="bg-card border-2 border-primary/10 rounded-[2rem] p-8 md:p-12 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
              <div className="relative w-32 h-32 md:w-48 md:h-48 bg-background rounded-full border-4 border-muted/50 p-4 shadow-xl shrink-0">
                <Image
                  src={team.team_badge}
                  alt={team.team_name}
                  fill
                  sizes="192px"
                  className="object-contain p-2"
                />
              </div>
              <div className="flex-1 text-center md:text-left z-10 flex flex-col justify-center h-full pt-2 md:pt-4">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                  {team.team_name}
                </h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <span className="bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                    <Trophy className="w-4 h-4" /> Copa do Mundo 2026
                  </span>
                  <span className="bg-muted text-muted-foreground px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> {teamGames.length} Partidas
                  </span>
                </div>
              </div>
            </div>

            {/* Layout de Conteúdo */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Coluna Principal: Jogos */}
              <div className="lg:col-span-2 space-y-10">
                <section>
                  <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-3">
                    <span className="w-2 h-8 bg-primary rounded-full"></span>
                    Próximos Jogos
                  </h2>
                  {renderGameList(
                    upcomingGames,
                    "Nenhum jogo programado para o futuro.",
                  )}
                </section>

                <section>
                  <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-3">
                    <span className="w-2 h-8 bg-muted-foreground rounded-full"></span>
                    Últimos Resultados
                  </h2>
                  {renderGameList(
                    pastGames,
                    "Nenhum resultado anterior registrado.",
                  )}
                </section>
              </div>

              {/* Coluna Secundária: Escalação */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 bg-card border rounded-[2rem] p-6 shadow-sm">
                  <h3 className="text-xl font-extrabold mb-2 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" /> Escalação Base
                  </h3>
                  <p className="text-xs text-muted-foreground mb-6">
                    Baseada na última partida disponível.
                  </p>

                  {baseLineup ? (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 border-b pb-2">
                          Titulares
                        </h4>
                        <div className="space-y-1">
                          {baseLineup.starting_lineups.map(
                            (player: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between py-2 rounded-lg group"
                              >
                                <span className="font-medium text-sm flex items-center gap-3">
                                  <span className="w-7 text-center text-xs font-bold text-muted-foreground bg-muted group-hover:bg-primary/20 group-hover:text-primary transition-colors rounded-md py-1">
                                    {player.player_number || "-"}
                                  </span>
                                  {player.player}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>

                      {baseLineup.coach?.length > 0 && (
                        <div className="pt-4 mt-2 border-t">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                            Técnico
                          </h4>
                          <div className="flex items-center gap-3 py-2">
                            <div className="bg-primary/10 p-2 rounded-full text-primary">
                              <User className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-sm">
                              {baseLineup.coach[0].lineup_player}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-muted/50 p-6 rounded-xl text-center border border-dashed border-border/60">
                      <Users className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm font-medium">
                        Escalação não disponível.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
            <h2 className="text-2xl font-bold mb-2">Seleção não encontrada</h2>
            <p className="text-muted-foreground">
              A equipe que você está procurando não existe ou não está na nossa
              base.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
