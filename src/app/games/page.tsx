"use client";

import React from "react";
import useSWR from "swr";
import { fetcher, endpoints, Game, Team } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MatchList } from "@/components/worldcup/MatchList";

export default function GamesPage() {
  const { data: gamesData, isLoading: loadingGames } = useSWR<{ games: Game[] }>(endpoints.games, fetcher);
  const { data: teamsData, isLoading: loadingTeams } = useSWR<{ teams: Team[] }>(endpoints.teams, fetcher);

  const loading = loadingGames || loadingTeams;

  const games = gamesData?.games || [];
  const teams = teamsData?.teams || [];

  const teamsMap = teams.reduce((acc, team) => {
    acc[team.team_key] = team;
    return acc;
  }, {} as Record<string, Team>);

  return (
    <div className="min-h-screen bg-background font-sans antialiased text-foreground flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Jogos da Copa</h1>
          <p className="text-muted-foreground">Acompanhe todas as partidas do torneio, resultados e calendário completo.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground animate-pulse font-medium">Carregando jogos...</p>
          </div>
        ) : (
          <div className="h-[75vh]">
            <MatchList games={games} teamsMap={teamsMap} title="" />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
