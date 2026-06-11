"use client";

import React, { useMemo } from "react";
import useSWR from "swr";
import { endpoints, fetcher, Standing, Team, Game } from "@/lib/api";
import { GroupTable } from "./GroupTable";
import { MatchList } from "./MatchList";
import { Skeleton } from "@/components/ui/skeleton";

export function Dashboard() {
  // Fetch data with auto revalidation (polling every 30 seconds for live updates)
  const {
    data: groupsData,
    error: groupsError,
    isLoading: groupsLoading,
  } = useSWR<{ groups: Standing[] }>(endpoints.groups, fetcher, {
    refreshInterval: 30000,
  });
  const {
    data: teamsData,
    error: teamsError,
    isLoading: teamsLoading,
  } = useSWR<{ teams: Team[] }>(endpoints.teams, fetcher, {
    refreshInterval: 300000,
  }); // Teams data doesn't change often
  const {
    data: gamesData,
    error: gamesError,
    isLoading: gamesLoading,
  } = useSWR<{ games: Game[] }>(endpoints.games, fetcher, {
    refreshInterval: 30000,
  });

  const isLoading = groupsLoading || teamsLoading || gamesLoading;
  const error = groupsError || teamsError || gamesError;

  // Criar um mapa de times para fácil acesso por ID
  const teamsMap = useMemo(() => {
    const map: Record<string, Team> = {};
    if (teamsData?.teams) {
      teamsData.teams.forEach((team) => {
        map[team.team_key] = team;
      });
    }
    return map;
  }, [teamsData]);

  const standings = groupsData?.groups || [];
  const games = gamesData?.games || [];

  const groupedStandings = useMemo(() => {
    const map = new Map<string, Standing[]>();
    standings.forEach((item) => {
      const groupName = item.league_round || "Grupo";
      if (!map.has(groupName)) map.set(groupName, []);
      map.get(groupName)!.push(item);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [standings]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-red-500 bg-red-500/10 rounded-xl p-8 border border-red-500/20">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mb-4"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h2 className="text-xl font-bold mb-2">Erro ao carregar dados</h2>
        <p className="text-sm opacity-80">
          Não foi possível conectar com a API (worldcup26.ir).
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Skeleton className="h-8 rounded-md w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-card rounded-xl border overflow-hidden h-[340px]">
                  <Skeleton className="h-12 border-b rounded-none" />
                  <div className="p-4 space-y-4 mt-2">
                    {[1, 2, 3, 4].map((j) => (
                      <Skeleton key={j} className="h-10 rounded-md w-full" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl border h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
              <div className="bg-muted/50 h-14 border-b flex items-center justify-between px-4">
                <Skeleton className="h-6 rounded-md w-32" />
                <Skeleton className="h-5 rounded-full w-16" />
              </div>
              <div className="p-4 space-y-4 flex-1">
                <Skeleton className="h-10 rounded-lg w-full mb-6" />
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-lg w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Transmissão ao Vivo */}
      {/*<div className="w-full bg-card rounded-xl border shadow-sm overflow-hidden mb-8">
        <div className="bg-muted/50 px-4 py-3 border-b flex items-center justify-between">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            Transmissão Ao Vivo - CazéTV
          </h2>
        </div>
        <div className="aspect-video w-full relative">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/live_stream?channel=UCi98-Vw2J5L_155m7yQ034A&autoplay=1&mute=1"
            title="Transmissão Ao Vivo da Copa 2026 - CazéTV"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        <div className="bg-muted/30 px-4 py-3 border-t text-center">
          <a
            href="https://www.youtube.com/@CazeTV/streams"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 text-sm font-medium text-red-500 hover:text-red-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
            Procurar e ver todas as transmissões ativas na CazéTV
          </a>
        </div>
      </div>*/}

      {/* Seção Principal de Grupos e Jogos do Dia */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <path d="M15 2h-6a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z" />
                <path d="M12 11h4" />
                <path d="M12 16h4" />
                <path d="M8 11h.01" />
                <path d="M8 16h.01" />
              </svg>
              Fase de Grupos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
            {groupedStandings.map(([groupName, groupStandings]) => (
              <GroupTable key={groupName} groupName={groupName} standings={groupStandings} teamsMap={teamsMap} games={games} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 h-[calc(100vh-8rem)]">
            <MatchList
              games={games}
              teamsMap={teamsMap}
              title="Todos os Jogos"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
