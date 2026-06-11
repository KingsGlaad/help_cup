import React from "react";
import { Standing, Team, Game } from "@/lib/api";
import Image from "next/image";

interface GroupTableProps {
  groupName: string;
  standings: Standing[];
  teamsMap: Record<string, Team>;
  games?: Game[];
}

export function GroupTable({ groupName, standings, teamsMap, games }: GroupTableProps) {
  const cleanGroupName = groupName.replace(/group\s+/i, "").trim();

  const enrichedStandings = standings.map((team) => {
    if (!games || games.length === 0) return team;

    const teamGames = games.filter(
      (g) => g.match_hometeam_id === team.team_id || g.match_awayteam_id === team.team_id
    );

    let played = 0;
    let w = 0;
    let d = 0;
    let l = 0;
    let gf = 0;
    let ga = 0;

    teamGames.forEach((g) => {
      if (g.match_status === "Finished") {
        played++;
        const isHome = g.match_hometeam_id === team.team_id;
        const homeScore = parseInt(g.match_hometeam_score) || 0;
        const awayScore = parseInt(g.match_awayteam_score) || 0;

        const teamScore = isHome ? homeScore : awayScore;
        const oppScore = isHome ? awayScore : homeScore;

        gf += teamScore;
        ga += oppScore;

        if (teamScore > oppScore) w++;
        else if (teamScore === oppScore) d++;
        else l++;
      }
    });

    const pts = w * 3 + d;
    const apiPlayed = parseInt(team.overall_league_payed) || 0;
    
    if (played > apiPlayed || apiPlayed === 0) {
      return {
        ...team,
        overall_league_payed: played.toString(),
        overall_league_W: w.toString(),
        overall_league_D: d.toString(),
        overall_league_L: l.toString(),
        overall_league_GF: gf.toString(),
        overall_league_GA: ga.toString(),
        overall_league_PTS: pts.toString(),
      };
    }

    return team;
  });

  const sortedTeams = [...enrichedStandings].sort((a, b) => {
    const ptsA = parseInt(a.overall_league_PTS) || 0;
    const ptsB = parseInt(b.overall_league_PTS) || 0;
    if (ptsB !== ptsA) return ptsB - ptsA;

    const gfA = parseInt(a.overall_league_GF) || 0;
    const gaA = parseInt(a.overall_league_GA) || 0;
    const gfB = parseInt(b.overall_league_GF) || 0;
    const gaB = parseInt(b.overall_league_GA) || 0;

    const gdA = gfA - gaA;
    const gdB = gfB - gaB;
    if (gdB !== gdA) return gdB - gdA;

    return gfB - gfA;
  });

  return (
    <div className="bg-card text-card-foreground rounded-xl border shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="bg-muted/50 px-4 py-3 border-b">
        <h3 className="font-bold text-lg">Grupo {cleanGroupName}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground bg-muted/20 uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Pos</th>
              <th className="px-4 py-3 font-medium">Seleção</th>
              <th className="px-3 py-3 font-medium text-center" title="Jogos">
                J
              </th>
              <th
                className="px-3 py-3 font-medium text-center"
                title="Vitórias"
              >
                V
              </th>
              <th className="px-3 py-3 font-medium text-center" title="Empates">
                E
              </th>
              <th
                className="px-3 py-3 font-medium text-center"
                title="Derrotas"
              >
                D
              </th>
              <th
                className="px-3 py-3 font-medium text-center"
                title="Saldo de Gols"
              >
                SG
              </th>
              <th className="px-4 py-3 font-bold text-center" title="Pontos">
                Pts
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map((teamStats, index) => {
              const teamInfo = teamsMap[teamStats.team_id];
              const isQualified = index < 2; // Primeiros 2 geralmente classificam
              const gd = parseInt(teamStats.overall_league_GF) - parseInt(teamStats.overall_league_GA);

              return (
                <tr
                  key={teamStats.team_id}
                  className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${
                    isQualified
                      ? "border-l-4 border-l-green-500"
                      : "border-l-4 border-l-transparent"
                  }`}
                >
                  <td className="px-4 py-3 text-center font-medium">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {teamInfo?.team_badge || teamStats.team_badge ? (
                        <Image
                          src={teamInfo?.team_badge || teamStats.team_badge}
                          alt={teamInfo?.team_name || teamStats.team_name}
                          width={24}
                          height={16}
                          style={{ width: "auto", height: "auto" }}
                          className="object-cover rounded-sm shadow-sm"
                        />
                      ) : (
                        <div className="w-6 h-4 bg-muted rounded-sm animate-pulse" />
                      )}
                      <span className="font-semibold">
                        {teamInfo?.team_name || teamStats.team_name || "Carregando..."}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">{teamStats.overall_league_payed}</td>
                  <td className="px-3 py-3 text-center">{teamStats.overall_league_W}</td>
                  <td className="px-3 py-3 text-center">{teamStats.overall_league_D}</td>
                  <td className="px-3 py-3 text-center">{teamStats.overall_league_L}</td>
                  <td className="px-3 py-3 text-center">{gd > 0 ? `+${gd}` : gd}</td>
                  <td className="px-4 py-3 text-center font-bold text-green-600">
                    {teamStats.overall_league_PTS}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
