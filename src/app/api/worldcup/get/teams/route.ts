import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.API_FOOTBALL_KEY;
  const leagueId = process.env.LEAGUE_ID || "28";

  if (!apiKey) {
    return NextResponse.json(
      { error: "API_FOOTBALL_KEY is not set" },
      { status: 500 },
    );
  }

  try {
    const url = `https://apiv3.apifootball.com/?action=get_teams&league_id=${leagueId}&APIkey=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    const data = await res.json();

    // Retornamos os dados exatamente como a API-Football enviou
    return NextResponse.json({ teams: data });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 },
    );
  }
}
