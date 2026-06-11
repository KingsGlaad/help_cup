import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.API_FOOTBALL_KEY;
  const leagueId = process.env.LEAGUE_ID || '28';

  if (!apiKey) {
    return NextResponse.json({ error: 'API_FOOTBALL_KEY is not set' }, { status: 500 });
  }

  try {
    // Limitamos o intervalo para não pegar jogos da Copa de 2022
    const from = '2026-06-10';
    const to = '2026-08-05';
    const url = `https://apiv3.apifootball.com/?action=get_events&from=${from}&to=${to}&league_id=${leagueId}&timezone=America/Sao_Paulo&APIkey=${apiKey}`;
    
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();

    // Retornamos os dados exatamente como a API-Football enviou, mantendo a camada BFF leve e segura
    return NextResponse.json({ games: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}
