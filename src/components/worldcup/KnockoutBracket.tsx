/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import Image from "next/image";
import { Trophy } from "lucide-react";

type TreeNode = {
  game: any | null;
  children: TreeNode[];
};

const COLUMNS = ["16 Avos", "Oitavas", "Quartas", "Semifinal", "Final"];

const MatchCard = ({ game }: { game: any }) => {
  if (!game) {
    return (
      <div className="w-[180px] sm:w-48 bg-card/50 border border-dashed rounded-md shadow-sm opacity-60">
        <div className="py-1.5 px-2 flex items-center justify-between">
          <div className="w-4 h-3 bg-muted rounded-[2px] shrink-0" />
          <span className="text-xs font-medium text-muted-foreground flex-1 ml-2 truncate">
            A Definir
          </span>
        </div>
        <div className="h-px bg-border/50 w-full" />
        <div className="py-1.5 px-2 flex items-center justify-between">
          <div className="w-4 h-3 bg-muted rounded-[2px] shrink-0" />
          <span className="text-xs font-medium text-muted-foreground flex-1 ml-2 truncate">
            A Definir
          </span>
        </div>
      </div>
    );
  }

  const isFinished = game.match_status === "Finished";
  const isLive = game.match_live === "1";

  const renderTeam = (
    name: string,
    badge: string,
    score: string,
    isWinner: boolean,
  ) => (
    <div className="flex items-center justify-between py-1.5 px-2">
      <div className="flex items-center gap-1.5 overflow-hidden flex-1">
        {badge ? (
          <div className="relative w-4 h-3 shrink-0 overflow-hidden rounded-[2px] shadow-sm">
            <Image
              src={badge}
              alt={name}
              fill
              sizes="16px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-4 h-3 bg-muted rounded-[2px] shrink-0" />
        )}
        <span
          className={`text-[11px] leading-tight truncate ${isWinner ? "font-bold text-foreground" : "font-medium text-muted-foreground"}`}
          title={name}
        >
          {name}
        </span>
      </div>
      <span
        className={`text-xs ml-2 ${isWinner ? "font-bold text-foreground" : "font-medium text-muted-foreground"}`}
      >
        {game.match_status !== "" ? score || "0" : "-"}
      </span>
    </div>
  );

  const homeScore = parseInt(game.match_hometeam_score) || 0;
  const awayScore = parseInt(game.match_awayteam_score) || 0;
  const homePenalties = parseInt(game.match_hometeam_penalty_score) || 0;
  const awayPenalties = parseInt(game.match_awayteam_penalty_score) || 0;

  const homeWinner =
    isFinished && (homeScore > awayScore || homePenalties > awayPenalties);
  const awayWinner =
    isFinished && (awayScore > homeScore || awayPenalties > homePenalties);

  return (
    <div
      className={`w-[180px] sm:w-48 block relative group bg-card border rounded-md shadow-sm overflow-hidden transition-all duration-200 hover:border-primary/50 hover:shadow-md ${isLive ? "ring-1 ring-green-500/50" : ""}`}
    >
      <div className="flex items-center justify-between px-2 py-0.5 bg-muted/50 border-b text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">
        <span>{game.match_date !== "TBD" ? game.match_date : "A Definir"}</span>
        {isLive && (
          <span className="text-green-500 animate-pulse">Ao Vivo</span>
        )}
      </div>
      <div className="flex flex-col">
        {renderTeam(
          game.match_hometeam_name,
          game.team_home_badge,
          game.match_hometeam_score,
          homeWinner,
        )}
        <div className="h-px bg-border/50 w-full" />
        {renderTeam(
          game.match_awayteam_name,
          game.team_away_badge,
          game.match_awayteam_score,
          awayWinner,
        )}
      </div>
    </div>
  );
};

const BranchNode = ({ node }: { node: TreeNode }) => {
  if (!node.children || node.children.length !== 2) {
    return (
      <div className="py-2 relative z-10 bg-background">
        <MatchCard game={node.game} />
      </div>
    );
  }

  return (
    <div className="flex items-center relative">
      {/* Coluna dos jogos anteriores (filhos) */}
      <div className="flex flex-col justify-center relative z-0">
        <div className="flex items-stretch relative">
          <BranchNode node={node.children[0]} />
          {/* Conector descendo (top right) */}
          <div className="absolute right-0 top-1/2 bottom-0 w-4 sm:w-6 border-t-2 border-r-2 border-primary/20 rounded-tr-lg translate-x-full"></div>
        </div>
        <div className="flex items-stretch relative">
          <BranchNode node={node.children[1]} />
          {/* Conector subindo (bottom right) */}
          <div className="absolute right-0 top-0 bottom-1/2 w-4 sm:w-6 border-b-2 border-r-2 border-primary/20 rounded-br-lg translate-x-full"></div>
        </div>
      </div>

      {/* Jogo atual (pai) */}
      <div className="pl-8 sm:pl-12 relative flex items-center z-10 bg-background">
        {/* Linha horizontal para o pai */}
        <div className="absolute left-4 sm:left-6 top-1/2 w-4 sm:w-6 border-b-2 border-primary/20"></div>
        <div className="py-2">
          <MatchCard game={node.game} />
        </div>
      </div>
    </div>
  );
};

export function KnockoutBracket() {
  const { data, isLoading } = useSWR<{ games: any[] }>(
    "/api/worldcup/bracket",
    fetcher,
    {
      refreshInterval: 60000,
    },
  );

  const bracketTree = useMemo(() => {
    if (!data?.games || data.games.length === 0) return null;

    // Constrói a árvore recursivamente a partir de um match_id
    const buildTree = (games: any[], rootId: string): TreeNode => {
      const game = games.find((g) => g.match_id === rootId);
      if (!game) return { game: null, children: [] };

      const children: TreeNode[] = [];
      if (game.source_home) {
        children.push(buildTree(games, game.source_home));
      }
      if (game.source_away) {
        children.push(buildTree(games, game.source_away));
      }

      return { game, children };
    };

    // A raiz da nossa árvore é o jogo da Final
    const finalGame = data.games.find((g) => g.match_round === "final");
    if (finalGame) {
      return buildTree(data.games, finalGame.match_id);
    }

    return null;
  }, [data]);

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden mb-8">
      <div className="bg-muted/50 px-6 py-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Chaveamento (Mata-Mata)
        </h2>
      </div>

      <div className="p-6 overflow-x-auto hide-scrollbar custom-scrollbar relative">
        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Carregando chaveamento...
          </div>
        ) : !bracketTree ? (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Chaveamento não disponível.
          </div>
        ) : (
          <div className="relative min-w-max pb-4">
            <div className="flex gap-8 sm:gap-12 mb-6 pl-0">
              {COLUMNS.map((col) => (
                <div
                  key={col}
                  className="w-[180px] sm:w-48 text-center shrink-0"
                >
                  <h3 className="font-black text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground bg-muted/80 inline-block px-3 py-1 rounded-full border">
                    {col}
                  </h3>
                </div>
              ))}
            </div>
            <div className="flex items-center">
              <BranchNode node={bracketTree} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
