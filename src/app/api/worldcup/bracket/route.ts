/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

const countryTranslations: Record<string, string> = {
  Mexico: "México",
  "South Africa": "África do Sul",
  "South Korea": "Coreia do Sul",
  Brazil: "Brasil",
  Argentina: "Argentina",
  Spain: "Espanha",
  Germany: "Alemanha",
  France: "França",
  England: "Inglaterra",
  Portugal: "Portugal",
  Italy: "Itália",
  Netherlands: "Holanda",
  "United States": "Estados Unidos",
  Uruguay: "Uruguai",
  Colombia: "Colômbia",
  Belgium: "Bélgica",
  Croatia: "Croácia",
  Japan: "Japão",
  Morocco: "Marrocos",
  Switzerland: "Suíça",
  Senegal: "Senegal",
  Cameroon: "Camarões",
  Canada: "Canadá",
  Ecuador: "Equador",
  "Saudi Arabia": "Arábia Saudita",
  Poland: "Polônia",
  Australia: "Austrália",
  "Costa Rica": "Costa Rica",
  Tunisia: "Tunísia",
  Peru: "Peru",
  Sweden: "Suécia",
  Denmark: "Dinamarca",
  Iran: "Irã",
  Wales: "País de Gales",
  Serbia: "Sérvia",
  Algeria: "Argélia",
  Turkey: "Turquia",
  Egypt: "Egito",
  "Cape Verde": "Cabo Verde",
};

function translateTeamName(nameEn: string | undefined): string {
  if (!nameEn) return "";
  return countryTranslations[nameEn] || nameEn;
}

function translateLabel(label: string | undefined): string {
  if (!label) return "";
  let translated = label;
  translated = translated.replace(/Winner Group ([A-L])/i, "1º Grupo $1");
  translated = translated.replace(/Runner-up Group ([A-L])/i, "2º Grupo $1");
  translated = translated.replace(/3rd Place Group (.*)/i, "3º Grupo $1");
  translated = translated.replace(/Winner Match (\d+)/i, "Venc. Jogo $1");
  translated = translated.replace(/Loser Match (\d+)/i, "Perd. Jogo $1");
  return translated;
}

export async function GET() {
  try {
    const [gamesRes, teamsRes] = await Promise.all([
      fetch("https://worldcup26.ir/get/games", { next: { revalidate: 60 } }),
      fetch("https://worldcup26.ir/get/teams", { next: { revalidate: 3600 } }),
    ]);

    const gamesData = await gamesRes.json();
    const teamsData = await teamsRes.json();

    const teamsMap: Record<string, { name: string; flag: string }> = {};
    if (teamsData?.teams) {
      teamsData.teams.forEach((t: any) => {
        teamsMap[t.id] = {
          name: translateTeamName(t.name_en),
          flag: t.flag,
        };
      });
    }

    const bracketGames =
      gamesData?.games?.filter((g: any) => g.type !== "group") || [];

    const formattedGames = bracketGames.map((g: any) => {
      const isHomeDecided = g.home_team_id !== "0" && g.home_team_id !== "";
      const isAwayDecided = g.away_team_id !== "0" && g.away_team_id !== "";

      const homeName = isHomeDecided
        ? teamsMap[g.home_team_id]?.name ||
          translateTeamName(g.home_team_name_en)
        : translateLabel(g.home_team_label);

      const awayName = isAwayDecided
        ? teamsMap[g.away_team_id]?.name ||
          translateTeamName(g.away_team_name_en)
        : translateLabel(g.away_team_label);

      const sourceHomeMatch = g.home_team_label?.match(/Match (\d+)/i);
      const sourceAwayMatch = g.away_team_label?.match(/Match (\d+)/i);

      return {
        match_id: g.id,
        match_hometeam_id: g.home_team_id,
        match_awayteam_id: g.away_team_id,
        match_hometeam_name: homeName,
        match_awayteam_name: awayName,
        match_hometeam_score: g.home_score !== "null" ? g.home_score : "",
        match_awayteam_score: g.away_score !== "null" ? g.away_score : "",
        match_status: g.finished === "TRUE" ? "Finished" : "",
        match_live:
          g.time_elapsed !== "notstarted" && g.time_elapsed !== "finished"
            ? "1"
            : "0",
        match_date: g.local_date
          ? g.local_date.split(" ")[0].replace(/\//g, "-")
          : "TBD",
        match_time: g.local_date ? g.local_date.split(" ")[1] : "",
        match_round: g.type, // 'r32', 'r16', 'qf', 'sf', 'final', 'third'
        team_home_badge: isHomeDecided
          ? teamsMap[g.home_team_id]?.flag || ""
          : "",
        team_away_badge: isAwayDecided
          ? teamsMap[g.away_team_id]?.flag || ""
          : "",
        match_hometeam_penalty_score: "",
        match_awayteam_penalty_score: "",
        source_home: sourceHomeMatch ? sourceHomeMatch[1] : null,
        source_away: sourceAwayMatch ? sourceAwayMatch[1] : null,
      };
    });

    return NextResponse.json({ games: formattedGames });
  } catch (error) {
    console.error("Error fetching bracket data:", error);
    return NextResponse.json(
      { error: "Failed to fetch bracket" },
      { status: 500 },
    );
  }
}
