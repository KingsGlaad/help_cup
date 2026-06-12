"use client";

import React from "react";
import useSWR from "swr";
import { fetcher, endpoints, Team } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

export default function TeamsPage() {
  const { data: teamsData, isLoading: loadingTeams } = useSWR<{
    teams: Team[];
  }>(endpoints.teams, fetcher);

  const teams = useMemo(() => {
    const rawTeams = teamsData?.teams || [];
    return [...rawTeams].sort((a, b) => {
      const nameA = a.team_name || "";
      const nameB = b.team_name || "";
      return nameA.localeCompare(nameB);
    });
  }, [teamsData]);

  return (
    <div className="min-h-screen bg-background font-sans antialiased text-foreground flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            Seleções
          </h1>
          <p className="text-lg text-muted-foreground">
            Conheça todas as seleções participantes da Copa do Mundo 2026.
          </p>
        </div>

        {loadingTeams ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground animate-pulse font-medium">
              Carregando seleções...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {teams.map((team) => (
              <Link
                key={team.team_key}
                className="group bg-card hover:bg-muted/50 transition-all duration-300 rounded-2xl border shadow-sm hover:shadow-md overflow-hidden flex flex-col items-center text-center p-6 relative"
                href={`/teams/${team.team_key}`}
              >
                <div className="w-20 h-20 relative rounded-full overflow-hidden mb-4 ring-4 ring-background shadow-lg border border-border/50 group-hover:scale-105 transition-transform duration-300">
                  {team.team_badge ? (
                    <Image
                      src={team.team_badge}
                      alt={team.team_name || "Flag"}
                      fill
                      sizes="(max-width: 640px) 80px, 80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      No Image
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-base leading-tight mb-1">
                  {team.team_name}
                </h3>
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-auto">
                  {team.team_name?.substring(0, 3).toUpperCase() || "TBA"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
