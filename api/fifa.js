const FIFA_API = 'https://api.fifa.com/api/v3/calendar/matches?idCompetition=17&idSeason=285023&language=en&count=200';

const FIFA_TO_OURS = {
  MEX: 'MEXICO', RSA: 'AFRICA_SUL', KOR: 'COREIA_SUL', CZE: 'REP_TCHECA',
  CAN: 'CANADA', BIH: 'BOSNIA', QAT: 'CATAR', SUI: 'SUICA',
  BRA: 'BRASIL', MAR: 'MARROCOS', HAI: 'HAITI', SCO: 'ESCOCIA',
  USA: 'USA', PAR: 'PARAGUAI', AUS: 'AUSTRALIA', TUR: 'TURQUIA',
  GER: 'ALEMANHA', CUW: 'CURACAO', CIV: 'COSTA_MARFIM', ECU: 'EQUADOR',
  NED: 'HOLANDA', JPN: 'JAPAO', SWE: 'SUECIA', TUN: 'TUNISIA',
  BEL: 'BELGICA', EGY: 'EGITO', IRN: 'IRA', NZL: 'NOVA_ZELANDIA',
  ESP: 'ESPANHA', CPV: 'CABO_VERDE', KSA: 'ARABIA', URU: 'URUGUAI',
  FRA: 'FRANCA', SEN: 'SENEGAL', IRQ: 'IRAQUE', NOR: 'NORUEGA',
  ARG: 'ARGENTINA', ALG: 'ARGELIA', AUT: 'AUSTRIA', JOR: 'JORDANIA',
  POR: 'PORTUGAL', COD: 'RD_CONGO', UZB: 'UZBEQUISTAO', COL: 'COLOMBIA',
  ENG: 'INGLATERRA', CRO: 'CROACIA', GHA: 'GANA', PAN: 'PANAMA',
};

function parseLocalDate(localDateStr) {
  const parts = localDateStr.slice(0, 10).split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
  const d = new Date(localDateStr);
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function mapFifaMatch(fifaMatch, ourMatches) {
  const homeCode = fifaMatch.Home?.Abbreviation;
  const awayCode = fifaMatch.Away?.Abbreviation;
  const ourHome = FIFA_TO_OURS[homeCode];
  const ourAway = FIFA_TO_OURS[awayCode];
  if (!ourHome || !ourAway) return null;
  const dateStr = parseLocalDate(fifaMatch.LocalDate || fifaMatch.Date);
  const ourMatch = ourMatches.find(m => m.homeTeam === ourHome && m.awayTeam === ourAway && m.date === dateStr);
  if (!ourMatch) return null;
  if (fifaMatch.HomeTeamScore === null || fifaMatch.AwayTeamScore === null) return null;
  return {
    matchId: ourMatch.id,
    homeScore: Number(fifaMatch.HomeTeamScore),
    awayScore: Number(fifaMatch.AwayTeamScore),
    played: true,
  };
}

export { FIFA_API, FIFA_TO_OURS, parseLocalDate, mapFifaMatch };
