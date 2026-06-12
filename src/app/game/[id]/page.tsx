/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { use, useEffect, useRef } from "react";
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
import { toast } from "sonner";
import {
  TimelineEventCard,
  TimelineEvent,
} from "./_components/TimelineEventCard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PlayerRow = ({
  player,
  teamName,
  game,
  subStatus,
}: {
  player: any;
  teamName: string;
  game: Game;
  subStatus?: "in" | "out";
}) => {
  const isHome = teamName === game.match_hometeam_name;
  const goals =
    game.goalscorer?.filter((g) =>
      isHome
        ? g.home_scorer === player.lineup_player
        : g.away_scorer === player.lineup_player,
    ).length || 0;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <li
            className={`px-4 py-3 flex justify-between items-center hover:bg-muted/30 transition-colors cursor-help border-b border-border/20 last:border-0 ${
              subStatus === "in"
                ? "bg-green-500/15 border-l-4 border-l-green-500 hover:bg-green-500/20"
                : subStatus === "out"
                  ? "bg-yellow-500/15 border-l-4 border-l-yellow-500 hover:bg-yellow-500/20 opacity-70"
                  : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`font-medium ${subStatus === "out" ? "line-through decoration-yellow-500/50" : ""} border-b border-dashed border-muted-foreground/50`}
              >
                {player.lineup_player || "Jogador"}
              </span>
              {subStatus === "in" && (
                <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded uppercase">
                  Entrou
                </span>
              )}
              {subStatus === "out" && (
                <span className="text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded uppercase">
                  Saiu
                </span>
              )}
            </div>
            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md font-mono shrink-0 ml-2">
              {player.lineup_number || "-"}
            </span>
          </li>
        </TooltipTrigger>
        <TooltipContent
          className="w-80 p-4 rounded-xl shadow-xl z-50 bg-card text-card-foreground border"
          sideOffset={10}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-muted overflow-hidden relative shrink-0 shadow-sm">
              {player.player_image ? (
                <Image
                  src={player.player_image}
                  alt={player.lineup_player}
                  className="object-cover"
                  fill
                  sizes="48px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary text-secondary-foreground font-black text-xl">
                  {(player.lineup_player || "J")[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm leading-tight truncate">
                {player.lineup_player}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {teamName}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs border-t pt-3">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase tracking-wider mb-0.5">
                Posição
              </span>
              <span className="font-semibold text-primary">
                {player.lineup_position || "—"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase tracking-wider mb-0.5">
                Gols na Partida
              </span>
              <span className="font-semibold text-primary">{goals}</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

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

  const games = gamesData?.games || [];
  const teams = teamsData?.teams || [];
  const groups = groupsData?.groups || [];

  const game = games.find((g) => g.match_id === id);

  const teamsMap = teams.reduce(
    (acc, team) => {
      acc[team.team_key] = team;
      return acc;
    },
    {} as Record<string, Team>,
  );

  const homeTeam = game ? teamsMap[game.match_hometeam_id] : undefined;
  const awayTeam = game ? teamsMap[game.match_awayteam_id] : undefined;

  // Tracking de gols para disparar o Sonner
  const isInitialLoad = useRef(true);
  const previousGoalsRef = useRef(0);

  useEffect(() => {
    if (!game) return;
    const currentGoals = game.goalscorer?.length || 0;

    if (isInitialLoad.current) {
      previousGoalsRef.current = currentGoals;
      isInitialLoad.current = false;
      return;
    }

    if (currentGoals > previousGoalsRef.current) {
      const newGoals = game.goalscorer?.slice(previousGoalsRef.current) || [];

      newGoals.forEach((goal) => {
        const isHome = !!goal.home_scorer;
        const playerName = isHome ? goal.home_scorer : goal.away_scorer;
        const teamName = isHome
          ? homeTeam?.team_name || game.match_hometeam_name
          : awayTeam?.team_name || game.match_awayteam_name;
        const flagUrl = isHome
          ? homeTeam?.team_badge || game.team_home_badge
          : awayTeam?.team_badge || game.team_away_badge;

        toast.custom(
          (t) => (
            <div
              className="relative overflow-hidden bg-linear-to-br from-green-600 to-emerald-800 text-white p-5 rounded-2xl shadow-2xl flex items-center gap-5 w-[350px] max-w-full border-2 border-green-400/30 cursor-pointer"
              onClick={() => toast.dismiss(t)}
            >
              {/* Rolling Ball Animation */}
              <div className="animate-[spin_1.5s_linear_infinite,bounce_0.8s_ease-in-out_infinite] text-5xl shrink-0 drop-shadow-xl z-10">
                ⚽
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col justify-center z-10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-black text-2xl uppercase tracking-widest text-yellow-300 drop-shadow-sm">
                    GOOOL!
                  </span>
                  {flagUrl && (
                    <div className="relative w-8 h-5 rounded-sm overflow-hidden ring-1 ring-white/50 shadow-sm shrink-0 bg-white">
                      <Image
                        src={flagUrl}
                        alt="Bandeira"
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
                <p className="font-bold text-xl leading-tight truncate drop-shadow-sm">
                  {playerName || "Jogador"}
                </p>
                <p className="text-sm font-medium text-green-100 opacity-90 truncate">
                  {teamName}
                </p>
              </div>

              {/* Decorative background stripes */}
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#fff_10px,#fff_20px)]"></div>
            </div>
          ),
          { duration: 6000, position: "top-center" },
        );
      });

      previousGoalsRef.current = currentGoals;
    } else if (currentGoals < previousGoalsRef.current) {
      previousGoalsRef.current = currentGoals;
    }
  }, [game, homeTeam, awayTeam]);

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

  // Identificar se é fase de grupos
  const isGroupStage =
    game.match_round?.toLowerCase().includes("group") ||
    ["1", "2", "3"].includes(game.match_round?.trim() || "");
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
        toast.error("Erro ao formatar data");
        return game.match_date;
        console.log(e);
      }
    }
    return "A definir";
  };

  const statusText = isLive
    ? game.match_status === "Half Time"
      ? "Intervalo"
      : game.match_status
        ? `${isNaN(Number(game.match_status)) ? game.match_status : `${game.match_status}'`}`
        : "Ao Vivo"
    : isFinished
      ? "Encerrado"
      : "Não Iniciado";

  // Função robusta para cruzar nomes abreviados da API
  const isMatch = (playerInLineup: string, playerInSub: string) => {
    if (!playerInLineup || !playerInSub) return false;
    const p1 = playerInLineup.toLowerCase().trim();
    const p2 = playerInSub.toLowerCase().trim();
    if (p1 === p2 || p1.includes(p2) || p2.includes(p1)) return true;

    // Checagem de abreviação: "N. Williams" vs "Nico Williams"
    const p1Parts = p1.split(" ").filter((x) => x.length > 0);
    const p2Parts = p2.split(" ").filter((x) => x.length > 0);

    if (p1Parts.length > 0 && p2Parts.length > 0) {
      const p1Last = p1Parts[p1Parts.length - 1];
      const p2Last = p2Parts[p2Parts.length - 1];

      if (p1Last === p2Last && p1Last.length > 2) {
        if (p1[0] === p2[0]) return true;
      }
    }
    return false;
  };

  const getSubStatus = (
    playerName: string,
    teamSubs: any[],
    isStarter: boolean,
  ): "in" | "out" | undefined => {
    if (!teamSubs || !playerName) return undefined;
    for (const sub of teamSubs) {
      if (!sub.substitution) continue;
      const parts = sub.substitution.split(" | ");
      if (parts.length >= 2) {
        // Formato In | Out ou Out | In. Como sabemos se é titular, resolvemos fácil:
        const subA = parts[0];
        const subB = parts[1];

        if (
          isStarter &&
          (isMatch(playerName, subA) || isMatch(playerName, subB))
        )
          return "out";
        if (
          !isStarter &&
          (isMatch(playerName, subA) || isMatch(playerName, subB))
        )
          return "in";
      } else {
        if (isStarter && isMatch(playerName, sub.substitution)) return "out";
        if (!isStarter && isMatch(playerName, sub.substitution)) return "in";
      }
    }
    return undefined;
  };

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
    if (!game.statistics || game.statistics.length === 0) return 0;
    const stat = game.statistics.find((s) => s.type === type);
    if (!stat) return 0;
    const val = (isHome ? stat.home : stat.away) || "0";
    const parsed = parseInt(val.replace("%", ""));
    return isNaN(parsed) ? 0 : parsed;
  };

  const hasStats = game.statistics && game.statistics.length > 0;

  const homePossession = getStat("Ball Possession", true);
  const awayPossession = getStat("Ball Possession", false);

  const homeShots = getStat("Shots Total", true);
  const awayShots = getStat("Shots Total", false);

  const homeShotsOnTarget = getStat("Shots On Goal", true);
  const awayShotsOnTarget = getStat("Shots On Goal", false);

  const homeYellowCards = getStat("Yellow Cards", true);
  const homeRedCards = getStat("Red Cards", true);

  const awayYellowCards = getStat("Yellow Cards", false);
  const awayRedCards = getStat("Red Cards", false);

  const homeCorners = getStat("Corners", true);
  const awayCorners = getStat("Corners", false);

  const homeFouls = getStat("Fouls", true);
  const awayFouls = getStat("Fouls", false);

  const homeOffsides = getStat("Offsides", true);
  const awayOffsides = getStat("Offsides", false);

  const homePasses = getStat("Passes Total", true);
  const awayPasses = getStat("Passes Total", false);

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
          <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-primary/10 to-transparent"></div>

          <div className="p-8 sm:p-12 relative z-10">
            <div className="text-center mb-10">
              <span className="inline-block px-3 py-1 rounded-full bg-secondary/50 text-secondary-foreground text-xs font-semibold mb-3 tracking-wide">
                {isGroupStage
                  ? `FASE DE GRUPOS • ${["1", "2", "3"].includes(game.match_round?.trim() || "") ? `RODADA ${game.match_round}` : game.match_round}`
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
              <div className="flex flex-col items-center justify-center relative">
                <div
                  className={`mb-4 px-6 py-2 rounded-full text-sm sm:text-lg font-bold shadow-sm backdrop-blur-md tracking-wider ${
                    game.match_status === "Half Time"
                      ? "bg-amber-500/90 text-white animate-pulse"
                      : isLive
                        ? "bg-red-500/90 text-white animate-pulse"
                        : isFinished
                          ? "bg-muted/80 text-muted-foreground"
                          : "bg-primary/90 text-primary-foreground"
                  }`}
                >
                  {statusText}
                </div>
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

                {/* Penalties & Extra Time for Knockout Stages */}
                {!isGroupStage &&
                (game.match_hometeam_extra_score ||
                  game.match_hometeam_penalty_score) ? (
                  <div className="mt-4 flex gap-2">
                    {game.match_hometeam_extra_score && (
                      <div className="px-3 py-1 bg-muted/50 rounded-full text-xs font-semibold text-muted-foreground tracking-widest uppercase border">
                        ET: {game.match_hometeam_extra_score} -{" "}
                        {game.match_awayteam_extra_score}
                      </div>
                    )}
                    {game.match_hometeam_penalty_score && (
                      <div className="px-3 py-1 bg-primary/10 rounded-full text-xs font-semibold text-primary tracking-widest uppercase border border-primary/20">
                        PEN: {game.match_hometeam_penalty_score} -{" "}
                        {game.match_awayteam_penalty_score}
                      </div>
                    )}
                  </div>
                ) : null}

                {game.match_hometeam_halftime_score ||
                game.match_awayteam_halftime_score ? (
                  <div className="mt-3 px-4 py-1.5 bg-muted/30 rounded-full text-sm font-semibold text-muted-foreground tracking-widest uppercase">
                    HT: {game.match_hometeam_halftime_score || "0"} -{" "}
                    {game.match_awayteam_halftime_score || "0"}
                  </div>
                ) : null}
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
                          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-border before:to-transparent">
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
                          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-border before:to-transparent">
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
                          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-border before:to-transparent">
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
                            (player: any, idx: number) => {
                              const name = player.lineup_player;
                              const subStatus = getSubStatus(
                                name,
                                game.substitutions?.home || [],
                                true,
                              );
                              return (
                                <PlayerRow
                                  key={idx}
                                  player={player}
                                  teamName={
                                    homeTeam?.team_name ||
                                    game.match_hometeam_name
                                  }
                                  game={game}
                                  subStatus={subStatus}
                                />
                              );
                            },
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
                                (player: any, idx: number) => {
                                  const name = player.lineup_player;
                                  const subStatus = getSubStatus(
                                    name,
                                    game.substitutions?.home || [],
                                    false,
                                  );
                                  return (
                                    <PlayerRow
                                      key={idx}
                                      player={player}
                                      teamName={
                                        homeTeam?.team_name ||
                                        game.match_hometeam_name
                                      }
                                      game={game}
                                      subStatus={subStatus}
                                    />
                                  );
                                },
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
                            (player: any, idx: number) => {
                              const name = player.lineup_player;
                              const subStatus = getSubStatus(
                                name,
                                game.substitutions?.away || [],
                                true,
                              );
                              return (
                                <PlayerRow
                                  key={idx}
                                  player={player}
                                  teamName={
                                    awayTeam?.team_name ||
                                    game.match_awayteam_name
                                  }
                                  game={game}
                                  subStatus={subStatus}
                                />
                              );
                            },
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
                                (player: any, idx: number) => {
                                  const name = player.lineup_player;
                                  const subStatus = getSubStatus(
                                    name,
                                    game.substitutions?.away || [],
                                    false,
                                  );
                                  return (
                                    <PlayerRow
                                      key={idx}
                                      player={player}
                                      teamName={
                                        awayTeam?.team_name ||
                                        game.match_awayteam_name
                                      }
                                      game={game}
                                      subStatus={subStatus}
                                    />
                                  );
                                },
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
