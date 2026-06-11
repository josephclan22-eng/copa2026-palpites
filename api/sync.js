import { dbGet, dbSet, ok } from './_db.js';

const FIFA_API = 'https://api.fifa.com/api/v3/calendar/matches?idCompetition=17&idSeason=285023&language=en&count=200';

const FIFA_TO_OURS = {
  MEX:'MEXICO',RSA:'AFRICA_SUL',KOR:'COREIA_SUL',CZE:'REP_TCHECA',
  CAN:'CANADA',BIH:'BOSNIA',QAT:'CATAR',SUI:'SUICA',
  BRA:'BRASIL',MAR:'MARROCOS',HAI:'HAITI',SCO:'ESCOCIA',
  USA:'USA',PAR:'PARAGUAI',AUS:'AUSTRALIA',TUR:'TURQUIA',
  GER:'ALEMANHA',CUW:'CURACAO',CIV:'COSTA_MARFIM',ECU:'EQUADOR',
  NED:'HOLANDA',JPN:'JAPAO',SWE:'SUECIA',TUN:'TUNISIA',
  BEL:'BELGICA',EGY:'EGITO',IRN:'IRA',NZL:'NOVA_ZELANDIA',
  ESP:'ESPANHA',CPV:'CABO_VERDE',KSA:'ARABIA',URU:'URUGUAI',
  FRA:'FRANCA',SEN:'SENEGAL',IRQ:'IRAQUE',NOR:'NORUEGA',
  ARG:'ARGENTINA',ALG:'ARGELIA',AUT:'AUSTRIA',JOR:'JORDANIA',
  POR:'PORTUGAL',COD:'RD_CONGO',UZB:'UZBEQUISTAO',COL:'COLOMBIA',
  ENG:'INGLATERRA',CRO:'CROACIA',GHA:'GANA',PAN:'PANAMA',
};

function parseLocalDate(str) {
  const parts = str.slice(0, 10).split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
  const d = new Date(str);
  return `${String(d.getUTCDate()).padStart(2,'0')}/${String(d.getUTCMonth()+1).padStart(2,'0')}`;
}

export default async (req, res) => {
  try {
    const { default: ourMatches } = await import('../src/data/matches.js');
    const fifaRes = await fetch(FIFA_API);
    const fifaData = await fifaRes.json();
    const currentResults = await dbGet('results');
    for (const fm of fifaData.Results) {
      const homeCode = fm.Home?.Abbreviation, awayCode = fm.Away?.Abbreviation;
      const ourHome = FIFA_TO_OURS[homeCode], ourAway = FIFA_TO_OURS[awayCode];
      if (!ourHome || !ourAway) continue;
      const dateStr = parseLocalDate(fm.LocalDate || fm.Date);
      const match = ourMatches.find(m => m.homeTeam === ourHome && m.awayTeam === ourAway && m.date === dateStr);
      if (!match || fm.HomeTeamScore === null || fm.AwayTeamScore === null) continue;
      currentResults[match.id] = { homeScore: Number(fm.HomeTeamScore), awayScore: Number(fm.AwayTeamScore), played: true };
    }
    await dbSet('results', currentResults);
    ok(res, { success: true, results: currentResults, lastSync: new Date().toISOString() });
  } catch {
    ok(res, { success: true, results: await dbGet('results'), lastSync: null });
  }
};
