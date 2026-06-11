import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const team1 = searchParams.get('team1') || '';
  const team2 = searchParams.get('team2') || '';

  // Nota: Extrair dados DIRETAMENTE da pesquisa do Google pelo servidor 
  // via "fetch" ou "cheerio" geralmente é bloqueado pelo sistema anti-bot do Google
  // (eles exigem a execução de JavaScript / reCAPTCHA).
  // Para fins de demonstração, esta rota retorna dados com estrutura real,
  // mas o ideal para produção é integrar uma API como "API-Football".

  try {
    // Simulação do scraping (como se tivéssemos feito o parse da página do Google)
    // Em um cenário real com Puppeteer/Playwright, faríamos a navegação aqui.
    
    // Gerar estatísticas baseadas nos nomes para ser consistente
    const seed = team1.length + team2.length;
    
    const mockScrapedData = {
      possession: {
        home: 45 + (seed % 10),
        away: 55 - (seed % 10)
      },
      shots: {
        home: 8 + (seed % 5),
        away: 6 + (seed % 4)
      },
      shotsOnTarget: {
        home: 3 + (seed % 3),
        away: 2 + (seed % 3)
      },
      cards: {
        home: { yellow: seed % 3, red: seed % 5 === 0 ? 1 : 0 },
        away: { yellow: (seed + 1) % 4, red: 0 }
      },
      events: [
        { time: "12'", type: "goal", team: "home", player: "Jogador 1" },
        { time: "34'", type: "yellow_card", team: "away", player: "Jogador 2" },
        { time: "67'", type: "goal", team: "away", player: "Jogador 3" }
      ],
      source: "Mock (Google Search Blocked)"
    };

    return NextResponse.json(mockScrapedData);
  } catch (error) {
    return NextResponse.json({ error: "Falha ao extrair dados" }, { status: 500 });
  }
}
