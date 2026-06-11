import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const apiKey = process.env.API_FOOTBALL_KEY;
  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get("match_id");

  if (!apiKey) {
    return NextResponse.json(
      { error: "API_FOOTBALL_KEY is not set" },
      { status: 500 },
    );
  }

  if (!matchId) {
    return NextResponse.json(
      { error: "match_id query parameter is required" },
      { status: 400 },
    );
  }

  try {
    const url = `https://apiv3.apifootball.com/?action=get_odds&match_id=${matchId}&APIkey=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    const data = await res.json();

    // Retornamos os dados exatamente como a API-Football enviou
    return NextResponse.json({ odds: data });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch odds" },
      { status: 500 },
    );
  }
}
