"use client";

import React, { useMemo } from "react";
import useSWR from "swr";
import { fetcher, endpoints, Standing, Team, Game } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { GroupTable } from "@/components/worldcup/GroupTable";

export default function GroupsPage() {
  const { data: groupsData, isLoading: loadingGroups } = useSWR<{ groups: Standing[] }>(endpoints.groups, fetcher);
  const { data: teamsData, isLoading: loadingTeams } = useSWR<{ teams: Team[] }>(endpoints.teams, fetcher);
  const { data: gamesData, isLoading: loadingGames } = useSWR<{ games: Game[] }>(endpoints.games, fetcher);

  const loading = loadingGroups || loadingTeams || loadingGames;

  const standings = Array.isArray(groupsData?.groups) ? groupsData.groups : [];
  const teams = Array.isArray(teamsData?.teams) ? teamsData.teams : [];
  const games = Array.isArray(gamesData?.games) ? gamesData.games : [];

  const teamsMap = teams.reduce((acc, team) => {
    acc[team.team_key] = team;
    return acc;
  }, {} as Record<string, Team>);

  const groupedStandings = useMemo(() => {
    const map = new Map<string, Standing[]>();
    standings.forEach((item) => {
      const groupName = item.league_round || "Grupo";
      if (!map.has(groupName)) map.set(groupName, []);
      map.get(groupName)!.push(item);
    });
    return Array.from(map.entries());
  }, [standings]);

  return (
    <div className="min-h-screen bg-background font-sans antialiased text-foreground flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Fase de Grupos</h1>
          <p className="text-muted-foreground">Classificação completa de todos os grupos da Copa do Mundo.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground animate-pulse font-medium">Carregando grupos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {groupedStandings.map(([groupName, groupStandings]) => (
              <div key={groupName} className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <GroupTable groupName={groupName} standings={groupStandings} teamsMap={teamsMap} games={games} />
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
