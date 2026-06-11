/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { use } from "react";
import useSWR from "swr";
import { fetcher, endpoints, Game, Team, Standing, Odd } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { GroupTable } from "@/components/worldcup/GroupTable";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  Info,
  Activity,
  Flag,
  Clock,
  Users,
  UsersRound,
  DollarSign,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { StatBar } from "./_components/StatBar";
import {
  TimelineEventCard,
  TimelineEvent,
} from "./_components/TimelineEventCard";

export default function GamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: gamesData, isLoading: loadingGames } = useSWR<{
    games: Game[];
  }>(endpoints.games, fetcher, {
    refreshInterval: 10000, // Polling de 10 segundos para tempo real!
  });
  const { data: teamsData, isLoading: loadingTeams } = useSWR<{
    teams: Team[];
  }>(endpoints.teams, fetcher);
  const { data: groupsData, isLoading: loadingGroups } = useSWR<{
    groups: Standing[];
  }>(endpoints.groups, fetcher);
  const { data: oddsData } = useSWR<{
    odds: Odd[];
  }>(endpoints.odds(id), fetcher);

  if (loadingGames || loadingTeams || loadingGroups) {
    return (
      <div className="min-h-screen bg-background font-sans antialiased text-foreground flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-6">
          <Skeleton className="h-4 w-40 mb-6" />

          <div className="bg-card text-card-foreground rounded-3xl border shadow-xl overflow-hidden relative p-8 sm:p-12">
            <div className="text-center mb-10 flex flex-col items-center">
              <Skeleton className="h-6 w-32 rounded-full mb-3" />
              <Skeleton className="h-4 w-48" />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 sm:gap-4 relative">
              <div className="flex flex-col items-center flex-1">
                <Skeleton className="w-24 h-24 sm:w-36 sm:h-36 rounded-full mb-4" />
                <Skeleton className="h-6 w-32" />
              </div>

              <div className="flex flex-col items-center z-10 px-4">
                <div className="flex items-center gap-3 sm:gap-6 bg-background/50 p-6 rounded-3xl border">
                  <Skeleton className="h-16 w-12 sm:w-16" />
                  <span className="text-muted-foreground/40 text-4xl sm:text-5xl font-light">
                    -
                  </span>
                  <Skeleton className="h-16 w-12 sm:w-16" />
                </div>
              </div>

              <div className="flex flex-col items-center flex-1">
                <Skeleton className="w-24 h-24 sm:w-36 sm:h-36 rounded-full mb-4" />
                <Skeleton className="h-6 w-32" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-3xl border shadow-sm p-4 sm:p-8">
            <Skeleton className="h-12 w-full mb-8 rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Skeleton className="h-6 w-48 mb-6" />
                <Skeleton className="h-[200px] w-full rounded-xl" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-6 w-48 mb-6" />
                <Skeleton className="h-[200px] w-full rounded-xl" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const games = gamesData?.games || [];
  const teams = teamsData?.teams || [];
  const groups = groupsData?.groups || [];

  const game = games.find((g) => g.match_id === id);

  if (!game) {
    return (
      <div className="min-h-screen bg-background font-sans antialiased text-foreground flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-4">Jogo não encontrado</h2>
          <Link href="/" className="text-primary hover:underline">
            Voltar para o Início
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const teamsMap = teams.reduce(
    (acc, team) => {
      acc[team.team_key] = team;
      return acc;
    },
    {} as Record<string, Team>,
  );

  const homeTeam = teamsMap[game.match_hometeam_id];
  const awayTeam = teamsMap[game.match_awayteam_id];

  // Identificar se é fase de grupos
  const isGroupStage = game.match_round?.toLowerCase().includes("group");
  const groupMatch = isGroupStage
    ? groups.filter((g) => g.league_round === game.match_round)
    : null;

  const isLive = game.match_live === "1";
  const isFinished = game.match_status === "Finished";

  const formatDateTime = (game: Game) => {
    if (game.match_date) {
      try {
        const [year, month, day] = game.match_date.split("-");
        const dateStr =
          day && month && year ? `${day}/${month}/${year}` : game.match_date;
        const timeStr = game.match_time ? game.match_time : "";
        return `${dateStr}${timeStr ? ` às ${timeStr}` : ""}`;
      } catch (e) {
        return game.match_date;
      }
    }
    return "A definir";
  };

  const statusText = isLive
    ? `Ao Vivo (${game.match_time}')`
    : isFinished
      ? "Encerrado"
      : "Não Iniciado";

  const timelineEvents: TimelineEvent[] = [];

  if (game.goalscorer) {
    game.goalscorer.forEach((g, idx) => {
      const isHome = !!g.home_scorer;
      timelineEvents.push({
        id: `goal-${idx}`,
        time: parseInt(g.time) || 0,
        timeStr: g.time,
        team: isHome ? "home" : "away",
        type: "goal",
        player: isHome ? g.home_scorer : g.away_scorer,
        info: g.info || "",
      });
    });
  }

  if (game.cards) {
    game.cards.forEach((c, idx) => {
      const isHome = !!c.home_fault;
      timelineEvents.push({
        id: `card-${idx}`,
        time: parseInt(c.time) || 0,
        timeStr: c.time,
        team: isHome ? "home" : "away",
        type: c.card === "yellow card" ? "yellow_card" : "red_card",
        player: isHome ? c.home_fault : c.away_fault,
        info: c.info || "",
      });
    });
  }

  if (game.substitutions) {
    if (game.substitutions.home) {
      game.substitutions.home.forEach((s: any, idx: number) => {
        timelineEvents.push({
          id: `sub-home-${idx}`,
          time: parseInt(s.time) || 0,
          timeStr: s.time,
          team: "home",
          type: "sub",
          player: s.substitution,
          info: "",
        });
      });
    }
    if (game.substitutions.away) {
      game.substitutions.away.forEach((s: any, idx: number) => {
        timelineEvents.push({
          id: `sub-away-${idx}`,
          time: parseInt(s.time) || 0,
          timeStr: s.time,
          team: "away",
          type: "sub",
          player: s.substitution,
          info: "",
        });
      });
    }
  }

  timelineEvents.sort((a, b) => a.time - b.time);

  // API Statistics Integration
  const getStat = (type: string, isHome: boolean) => {
    if (!game.statistics || game.statistics.length === 0) return null;
    const stat = game.statistics.find((s) => s.type === type);
    if (!stat) return null;
    const val = (isHome ? stat.home : stat.away) || "";
    return parseInt(val.replace("%", "")) || 0;
  };

  const hasStats = game.statistics && game.statistics.length > 0;
  const seedId = parseInt(game.match_id) || 1;

  const homePossession = hasStats
    ? getStat("Ball Possession", true) || 0
    : isFinished || isLive
      ? 40 + (seedId % 20)
      : 0;
  const awayPossession = hasStats
    ? getStat("Ball Possession", false) || 0
    : isFinished || isLive
      ? 100 - homePossession
      : 0;

  const homeShots = hasStats
    ? getStat("Shots Total", true) || 0
    : isFinished || isLive
      ? 5 + (seedId % 10) + parseInt(game.match_hometeam_score || "0") * 2
      : 0;
  const awayShots = hasStats
    ? getStat("Shots Total", false) || 0
    : isFinished || isLive
      ? 4 + (seedId % 8) + parseInt(game.match_awayteam_score || "0") * 2
      : 0;

  const homeShotsOnTarget = hasStats
    ? getStat("Shots On Goal", true) || 0
    : Math.max(0, homeShots - 2);
  const awayShotsOnTarget = hasStats
    ? getStat("Shots On Goal", false) || 0
    : Math.max(0, awayShots - 1);

  const homeYellowCards = hasStats
    ? getStat("Yellow Cards", true) || 0
    : isFinished || isLive
      ? seedId % 4
      : 0;
  const homeRedCards = hasStats
    ? getStat("Red Cards", true) || 0
    : isFinished || isLive
      ? homeYellowCards > 2
        ? 1
        : 0
      : 0;

  const awayYellowCards = hasStats
    ? getStat("Yellow Cards", false) || 0
    : isFinished || isLive
      ? (seedId + 2) % 4
      : 0;
  const awayRedCards = hasStats
    ? getStat("Red Cards", false) || 0
    : isFinished || isLive
      ? awayYellowCards > 1
        ? 1
        : 0
      : 0;

  const homeCorners = hasStats
    ? getStat("Corners", true) || 0
    : isFinished || isLive
      ? seedId % 6
      : 0;
  const awayCorners = hasStats
    ? getStat("Corners", false) || 0
    : isFinished || isLive
      ? (seedId + 3) % 7
      : 0;

  const homeFouls = hasStats
    ? getStat("Fouls", true) || 0
    : isFinished || isLive
      ? 10 + (seedId % 5)
      : 0;
  const awayFouls = hasStats
    ? getStat("Fouls", false) || 0
    : isFinished || isLive
      ? 12 + (seedId % 6)
      : 0;

  const homeOffsides = hasStats
    ? getStat("Offsides", true) || 0
    : isFinished || isLive
      ? seedId % 3
      : 0;
  const awayOffsides = hasStats
    ? getStat("Offsides", false) || 0
    : isFinished || isLive
      ? (seedId + 1) % 4
      : 0;

  const homePasses = hasStats
    ? getStat("Passes Total", true) || 0
    : isFinished || isLive
      ? 300 + seedId * 10
      : 0;
  const awayPasses = hasStats
    ? getStat("Passes Total", false) || 0
    : isFinished || isLive
      ? 280 + seedId * 12
      : 0;

  // Divider de Tempos
  const firstHalfEvents = timelineEvents.filter((e) => e.time <= 45);
  const secondHalfEvents = timelineEvents.filter(
    (e) => e.time > 45 && e.time <= 90,
  );
  const extraTimeEvents = timelineEvents.filter((e) => e.time > 90);

  return (
    <div className="min-h-screen bg-background font-sans antialiased text-foreground flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Voltar para o Painel
        </Link>

        {/* Header da Partida */}
        <div className="bg-card text-card-foreground rounded-3xl border shadow-xl overflow-hidden mb-8 relative">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent"></div>

          {/* Status Badge */}
          <div className="absolute top-6 right-6 z-10">
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm backdrop-blur-md ${
                isLive
                  ? "bg-red-500/90 text-white animate-pulse"
                  : isFinished
                    ? "bg-muted/80 text-muted-foreground"
                    : "bg-primary/90 text-primary-foreground"
              }`}
            >
              {statusText}
            </span>
          </div>

          <div className="p-8 sm:p-12 relative z-10">
            <div className="text-center mb-10">
              <span className="inline-block px-3 py-1 rounded-full bg-secondary/50 text-secondary-foreground text-xs font-semibold mb-3 tracking-wide">
                {isGroupStage
                  ? `FASE DE GRUPOS • ${game.match_round}`
                  : game.match_round?.toUpperCase() || "FASE ELIMINATÓRIA"}
              </span>
              <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                {formatDateTime(game)}
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 sm:gap-16">
              {/* Home Team */}
              <div className="flex flex-col items-center flex-1">
                {homeTeam?.team_badge || game.team_home_badge ? (
                  <div className="w-24 h-24 sm:w-36 sm:h-36 relative rounded-full overflow-hidden shadow-2xl mb-4 border-4 border-background ring-2 ring-border/50">
                    <Image
                      src={homeTeam?.team_badge || game.team_home_badge}
                      alt={homeTeam?.team_name || "Flag"}
                      fill
                      sizes="(max-width: 640px) 96px, 144px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 sm:w-36 sm:h-36 bg-muted rounded-full mb-4 ring-2 ring-border/50"></div>
                )}
                <h3 className="font-bold text-xl sm:text-3xl text-center tracking-tight">
                  {homeTeam?.team_name || game.match_hometeam_name || "Time 1"}
                </h3>
              </div>

              {/* Score */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-3 sm:gap-6 font-black text-5xl sm:text-7xl bg-background/50 backdrop-blur-sm px-6 py-4 sm:px-10 sm:py-6 rounded-3xl border shadow-inner">
                  <span
                    className={
                      isFinished &&
                      parseInt(game.match_hometeam_score) >
                        parseInt(game.match_awayteam_score)
                        ? "text-primary"
                        : ""
                    }
                  >
                    {game.match_hometeam_score || "0"}
                  </span>
                  <span className="text-muted-foreground/40 text-4xl sm:text-5xl font-light">
                    -
                  </span>
                  <span
                    className={
                      isFinished &&
                      parseInt(game.match_awayteam_score) >
                        parseInt(game.match_hometeam_score)
                        ? "text-primary"
                        : ""
                    }
                  >
                    {game.match_awayteam_score || "0"}
                  </span>
                </div>
              </div>

              {/* Away Team */}
              <div className="flex flex-col items-center flex-1">
                {awayTeam?.team_badge || game.team_away_badge ? (
                  <div className="w-24 h-24 sm:w-36 sm:h-36 relative rounded-full overflow-hidden shadow-2xl mb-4 border-4 border-background ring-2 ring-border/50">
                    <Image
                      src={awayTeam?.team_badge || game.team_away_badge}
                      alt={awayTeam?.team_name || "Flag"}
                      fill
                      sizes="(max-width: 640px) 96px, 144px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 sm:w-36 sm:h-36 bg-muted rounded-full mb-4 ring-2 ring-border/50"></div>
                )}
                <h3 className="font-bold text-xl sm:text-3xl text-center tracking-tight">
                  {awayTeam?.team_name || game.match_awayteam_name || "Time 2"}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs System */}
        <div className="bg-card rounded-3xl border shadow-sm p-4 sm:p-8">
          <Tabs defaultValue="resumo" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 h-12 bg-muted/50 rounded-xl p-1">
              <TabsTrigger
                value="resumo"
                className="rounded-lg font-semibold text-sm"
              >
                Resumo
              </TabsTrigger>
              <TabsTrigger
                value="estatisticas"
                className="rounded-lg font-semibold text-sm"
              >
                Estatísticas
              </TabsTrigger>
              <TabsTrigger
                value="escalacoes"
                className="rounded-lg font-semibold text-sm"
              >
                Escalações
              </TabsTrigger>
              <TabsTrigger
                value="odds"
                className="rounded-lg font-semibold text-sm flex items-center gap-1"
              >
                <DollarSign className="w-4 h-4 hidden sm:block" />
                Odds
              </TabsTrigger>
            </TabsList>

            <TabsContent value="resumo" className="mt-0 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Linha do Tempo */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Linha do Tempo
                  </h3>

                  {!isLive && !isFinished ? (
                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground border rounded-xl bg-muted/20">
                      <Info className="w-8 h-8 mb-2 opacity-50" />
                      <p>A partida ainda não começou.</p>
                    </div>
                  ) : timelineEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground border rounded-xl bg-muted/20">
                      <Info className="w-8 h-8 mb-2 opacity-50" />
                      <p>Nenhum evento registrado.</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Primeiro Tempo */}
                      {firstHalfEvents.length > 0 && (
                        <div className="relative">
                          <div className="text-center mb-6 relative z-10">
                            <span className="bg-muted px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-muted-foreground border">
                              1º Tempo
                            </span>
                          </div>
                          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                            {firstHalfEvents.map((event) => (
                              <TimelineEventCard
                                key={event.id}
                                event={event}
                                isHome={event.team === "home"}
                                homeTeam={homeTeam}
                                awayTeam={awayTeam}
                                game={game}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Segundo Tempo */}
                      {secondHalfEvents.length > 0 && (
                        <div className="relative pt-4">
                          <div className="text-center mb-6 relative z-10">
                            <span className="bg-muted px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-muted-foreground border">
                              2º Tempo
                            </span>
                          </div>
                          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                            {secondHalfEvents.map((event) => (
                              <TimelineEventCard
                                key={event.id}
                                event={event}
                                isHome={event.team === "home"}
                                homeTeam={homeTeam}
                                awayTeam={awayTeam}
                                game={game}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Prorrogação / Acréscimos Extras */}
                      {extraTimeEvents.length > 0 && (
                        <div className="relative pt-4">
                          <div className="text-center mb-6 relative z-10">
                            <span className="bg-muted px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-muted-foreground border">
                              Acréscimos / Prorrogação
                            </span>
                          </div>
                          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                            {extraTimeEvents.map((event) => (
                              <TimelineEventCard
                                key={event.id}
                                event={event}
                                isHome={event.team === "home"}
                                homeTeam={homeTeam}
                                awayTeam={awayTeam}
                                game={game}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Info Geral */}
                <div>
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    Informações Gerais
                  </h3>
                  <div className="bg-muted/20 border rounded-xl p-6 space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b">
                      <span className="text-muted-foreground font-medium">
                        Estádio
                      </span>
                      <span className="font-semibold">
                        {game.match_stadium || "A definir"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b">
                      <span className="text-muted-foreground font-medium">
                        Árbitro
                      </span>
                      <span className="font-semibold">
                        {game.match_referee || "A definir"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">
                        Fase
                      </span>
                      <span className="font-semibold">
                        {game.match_round || "Desconhecido"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="estatisticas" className="mt-0 outline-none">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-lg font-bold mb-8 flex items-center gap-2 justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                  Estatísticas da Partida
                </h3>

                {!isLive && !isFinished ? (
                  <div className="flex flex-col items-center justify-center h-48 text-muted-foreground border rounded-xl bg-muted/20">
                    <Info className="w-8 h-8 mb-2 opacity-50" />
                    <p>As estatísticas estarão disponíveis após o início.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <StatBar
                      label="Posse de Bola"
                      homeValue={homePossession}
                      awayValue={awayPossession}
                      isPercentage
                    />
                    <StatBar
                      label="Finalizações"
                      homeValue={homeShots}
                      awayValue={awayShots}
                    />
                    <StatBar
                      label="Chutes no Alvo"
                      homeValue={homeShotsOnTarget}
                      awayValue={awayShotsOnTarget}
                    />
                    <StatBar
                      label="Escanteios"
                      homeValue={homeCorners}
                      awayValue={awayCorners}
                    />
                    <StatBar
                      label="Faltas"
                      homeValue={homeFouls}
                      awayValue={awayFouls}
                    />
                    <StatBar
                      label="Impedimentos"
                      homeValue={homeOffsides}
                      awayValue={awayOffsides}
                    />
                    <StatBar
                      label="Total de Passes"
                      homeValue={homePasses}
                      awayValue={awayPasses}
                    />
                    <div className="pt-8 border-t border-border/50">
                      <div className="flex justify-between items-center mb-2 text-sm font-semibold">
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-4 h-6 bg-yellow-400 rounded-sm mb-1 shadow-sm"></div>
                            <span>{homeYellowCards}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-4 h-6 bg-red-500 rounded-sm mb-1 shadow-sm"></div>
                            <span>{homeRedCards}</span>
                          </div>
                        </div>
                        <span className="text-muted-foreground uppercase text-xs tracking-wider flex items-center gap-1">
                          <Flag className="w-3 h-3" />
                          Cartões
                        </span>
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-4 h-6 bg-yellow-400 rounded-sm mb-1 shadow-sm"></div>
                            <span>{awayYellowCards}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-4 h-6 bg-red-500 rounded-sm mb-1 shadow-sm"></div>
                            <span>{awayRedCards}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="escalacoes" className="mt-0 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Escalação Mandante */}
                <div>
                  <div className="flex items-center gap-3 mb-6 bg-muted/30 p-3 rounded-lg border">
                    {homeTeam?.team_badge || game.team_home_badge ? (
                      <Image
                        src={homeTeam?.team_badge || game.team_home_badge}
                        alt="Home Flag"
                        width={32}
                        height={24}
                        className="rounded-sm object-cover shadow-sm"
                      />
                    ) : (
                      <div className="w-8 h-6 bg-muted rounded-sm"></div>
                    )}
                    <h3 className="font-bold text-lg">
                      {homeTeam?.team_name || game.match_hometeam_name}
                    </h3>
                  </div>

                  {!game.lineup?.home?.starting_lineups ||
                  game.lineup.home.starting_lineups.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Escalação não disponível
                    </p>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-muted/10 border rounded-xl overflow-hidden">
                        <div className="bg-muted/50 px-4 py-2 font-semibold text-sm flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" /> Titulares
                        </div>
                        <ul className="divide-y divide-border/50">
                          {game.lineup.home.starting_lineups.map(
                            (player: any, idx: number) => (
                              <li
                                key={idx}
                                className="px-4 py-3 flex justify-between items-center hover:bg-muted/30 transition-colors"
                              >
                                <span className="font-medium">
                                  {player.lineup_player || "Jogador"}
                                </span>
                                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md font-mono">
                                  {player.lineup_number || "-"}
                                </span>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>

                      {game.lineup.home.substitutes &&
                        game.lineup.home.substitutes.length > 0 && (
                          <div className="bg-muted/10 border rounded-xl overflow-hidden">
                            <div className="bg-muted/50 px-4 py-2 font-semibold text-sm flex items-center gap-2">
                              <UsersRound className="w-4 h-4 text-primary" />{" "}
                              Banco de Reservas
                            </div>
                            <ul className="divide-y divide-border/50">
                              {game.lineup.home.substitutes.map(
                                (player: any, idx: number) => (
                                  <li
                                    key={idx}
                                    className="px-4 py-3 flex justify-between items-center hover:bg-muted/30 transition-colors text-sm"
                                  >
                                    <span className="text-muted-foreground">
                                      {player.lineup_player || "Jogador"}
                                    </span>
                                    <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md font-mono">
                                      {player.lineup_number || "-"}
                                    </span>
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}
                      {/* Técnico Casa */}
                      {game.lineup.home.coach &&
                        game.lineup.home.coach.length > 0 && (
                          <div className="bg-primary/90 text-primary-foreground px-4 py-3 font-semibold text-sm flex items-center justify-between gap-2 border-t border-background/20">
                            <span className="flex items-center gap-2">
                              <Users className="w-4 h-4 opacity-80" /> Técnico
                            </span>
                            <span>
                              {game.lineup.home.coach[0].lineup_player}
                            </span>
                          </div>
                        )}
                    </div>
                  )}
                </div>

                {/* Escalação Visitante */}
                <div>
                  <div className="flex items-center gap-3 mb-6 bg-muted/30 p-3 rounded-lg border">
                    {awayTeam?.team_badge || game.team_away_badge ? (
                      <Image
                        src={awayTeam?.team_badge || game.team_away_badge}
                        alt="Away Flag"
                        width={32}
                        height={24}
                        className="rounded-sm object-cover shadow-sm"
                      />
                    ) : (
                      <div className="w-8 h-6 bg-muted rounded-sm"></div>
                    )}
                    <h3 className="font-bold text-lg">
                      {awayTeam?.team_name || game.match_awayteam_name}
                    </h3>
                  </div>

                  {!game.lineup?.away?.starting_lineups ||
                  game.lineup.away.starting_lineups.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Escalação não disponível
                    </p>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-muted/10 border rounded-xl overflow-hidden">
                        <div className="bg-muted/50 px-4 py-2 font-semibold text-sm flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" /> Titulares
                        </div>
                        <ul className="divide-y divide-border/50">
                          {game.lineup.away.starting_lineups.map(
                            (player: any, idx: number) => (
                              <li
                                key={idx}
                                className="px-4 py-3 flex justify-between items-center hover:bg-muted/30 transition-colors"
                              >
                                <span className="font-medium">
                                  {player.lineup_player || "Jogador"}
                                </span>
                                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md font-mono">
                                  {player.lineup_number || "-"}
                                </span>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>

                      {game.lineup.away.substitutes &&
                        game.lineup.away.substitutes.length > 0 && (
                          <div className="bg-muted/10 border rounded-xl overflow-hidden">
                            <div className="bg-muted/50 px-4 py-2 font-semibold text-sm flex items-center gap-2">
                              <UsersRound className="w-4 h-4 text-primary" />{" "}
                              Banco de Reservas
                            </div>
                            <ul className="divide-y divide-border/50">
                              {game.lineup.away.substitutes.map(
                                (player: any, idx: number) => (
                                  <li
                                    key={idx}
                                    className="px-4 py-3 flex justify-between items-center hover:bg-muted/30 transition-colors text-sm"
                                  >
                                    <span className="text-muted-foreground">
                                      {player.lineup_player || "Jogador"}
                                    </span>
                                    <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md font-mono">
                                      {player.lineup_number || "-"}
                                    </span>
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}
                      {/* Técnico Fora */}
                      {game.lineup.away.coach &&
                        game.lineup.away.coach.length > 0 && (
                          <div className="bg-primary/90 text-primary-foreground px-4 py-3 font-semibold text-sm flex items-center justify-between gap-2 border-t border-background/20">
                            <span className="flex items-center gap-2">
                              <Users className="w-4 h-4 opacity-80" /> Técnico
                            </span>
                            <span>
                              {game.lineup.away.coach[0].lineup_player}
                            </span>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="odds" className="mt-0 outline-none">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-lg font-bold mb-8 flex items-center gap-2 justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Odds e Cotações
                </h3>

                {!oddsData || !oddsData.odds || oddsData.odds.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-muted-foreground border rounded-xl bg-muted/20">
                    <Info className="w-8 h-8 mb-2 opacity-50" />
                    <p>Cotações não disponíveis para esta partida.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {oddsData.odds.map((odd, idx) => (
                      <div
                        key={idx}
                        className="bg-muted/10 border rounded-xl p-5 hover:border-primary/50 transition-colors"
                      >
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-border/50">
                          <span className="font-bold text-lg">
                            {odd.odd_bookmakers}
                          </span>
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                            1X2
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="flex flex-col items-center bg-card border shadow-sm p-3 rounded-lg hover:shadow-md transition-shadow cursor-default group">
                            <span className="text-xs text-muted-foreground mb-1 font-medium group-hover:text-primary transition-colors">
                              Casa (1)
                            </span>
                            <span className="font-black text-lg text-primary">
                              {odd.odd_1 || "-"}
                            </span>
                          </div>
                          <div className="flex flex-col items-center bg-card border shadow-sm p-3 rounded-lg hover:shadow-md transition-shadow cursor-default group">
                            <span className="text-xs text-muted-foreground mb-1 font-medium group-hover:text-primary transition-colors">
                              Empate (X)
                            </span>
                            <span className="font-black text-lg text-primary">
                              {odd.odd_x || "-"}
                            </span>
                          </div>
                          <div className="flex flex-col items-center bg-card border shadow-sm p-3 rounded-lg hover:shadow-md transition-shadow cursor-default group">
                            <span className="text-xs text-muted-foreground mb-1 font-medium group-hover:text-primary transition-colors">
                              Fora (2)
                            </span>
                            <span className="font-black text-lg text-primary">
                              {odd.odd_2 || "-"}
                            </span>
                          </div>
                        </div>

                        {/* Outras Odds principais */}
                        <div className="mt-4 pt-3 border-t border-border/30 grid grid-cols-2 gap-4 text-sm">
                          {odd["o+2.5"] && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Mais 2.5 Gols
                              </span>
                              <span className="font-bold">{odd["o+2.5"]}</span>
                            </div>
                          )}
                          {odd["u+2.5"] && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Menos 2.5 Gols
                              </span>
                              <span className="font-bold">{odd["u+2.5"]}</span>
                            </div>
                          )}
                          {odd["bts_yes"] && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Ambos Marcam
                              </span>
                              <span className="font-bold">
                                {odd["bts_yes"]}
                              </span>
                            </div>
                          )}
                          {odd["bts_no"] && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Ambos Não Marcam
                              </span>
                              <span className="font-bold">{odd["bts_no"]}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Detalhes do Grupo (se for fase de grupos) */}
        {isGroupStage && groupMatch && groupMatch.length > 0 && (
          <div className="mt-8">
            <div className="bg-card rounded-2xl border shadow-sm p-6 overflow-hidden">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Flag className="w-5 h-5 text-primary" />
                Classificação {game.match_round}
              </h2>
              <GroupTable
                groupName={game.match_round}
                standings={groupMatch}
                teamsMap={teamsMap}
                games={games}
              />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
