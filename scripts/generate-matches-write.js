const F2O = {
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

const STAGE_MAP = {
  'First Stage': 'group',
  'Round of 32': 'round32',
  'Round of 16': 'round16',
  'Quarter-final': 'quarter',
  'Semi-final': 'semi',
  'Play-off for third place': 'third',
  'Final': 'final',
};

const VENUES = [
  'Estádio Azteca, Cidade do México',
  'Estádio Azteca, Cidade do México',
  'BC Place, Vancouver',
  'SoFi Stadium, Los Angeles',
  'BC Place, Vancouver',
  'MetLife Stadium, Nova Jersey',
  'MetLife Stadium, Nova Jersey',
  'SoFi Stadium, Los Angeles',
  'Mercedes-Benz Stadium, Atlanta',
  'AT&T Stadium, Dallas',
  'Mercedes-Benz Stadium, Atlanta',
  'AT&T Stadium, Dallas',
  'Estádio Akron, Guadalajara',
  'Lincoln Financial Field, Filadélfia',
  'Estádio Akron, Guadalajara',
  'Lincoln Financial Field, Filadélfia',
  'BMO Field, Toronto',
  'BMO Field, Toronto',
  'Arrowhead Stadium, Kansas City',
  'Arrowhead Stadium, Kansas City',
  'CenturyLink Field, Seattle',
  'BMO Field, Toronto',
  'Commonwealth Stadium, Edmonton',
  'CenturyLink Field, Seattle',
  'Estádio BBVA, Monterrey',
  'Commonwealth Stadium, Edmonton',
  'BC Place, Vancouver',
  'Estádio BBVA, Monterrey',
  "Levi's Stadium, São Francisco",
  'Gillette Stadium, Boston',
  'Gillette Stadium, Boston',
  'NRG Stadium, Houston',
  'NRG Stadium, Houston',
  'Hard Rock Stadium, Miami',
  'Hard Rock Stadium, Miami',
  'NRG Stadium, Houston',
  'Estádio Universitário, Cidade do México',
  'M&T Bank Stadium, Baltimore',
  'Estádio Universitário, Cidade do México',
  'M&T Bank Stadium, Baltimore',
  'Soldier Field, Chicago',
  'BC Place, Vancouver',
  'BC Place, Vancouver',
  'Soldier Field, Chicago',
  'Allegiant Stadium, Las Vegas',
  'Commonwealth Stadium, Edmonton',
  'Commonwealth Stadium, Edmonton',
  'Allegiant Stadium, Las Vegas',
  'BC Place, Vancouver',
  'BC Place, Vancouver',
  'MetLife Stadium, Nova Jersey',
  'MetLife Stadium, Nova Jersey',
  'Estádio Azteca, Cidade do México',
  'Estádio Azteca, Cidade do México',
  'Hard Rock Stadium, Miami',
  'Hard Rock Stadium, Miami',
  'AT&T Stadium, Dallas',
  'AT&T Stadium, Dallas',
  "Levi's Stadium, São Francisco",
  "Levi's Stadium, São Francisco",
  'BMO Field, Toronto',
  'BMO Field, Toronto',
  'Estádio Akron, Guadalajara',
  'Estádio Akron, Guadalajara',
  'M&T Bank Stadium, Baltimore',
  'M&T Bank Stadium, Baltimore',
  'BMO Field, Toronto',
  'BMO Field, Toronto',
  'Allegiant Stadium, Las Vegas',
  'Allegiant Stadium, Las Vegas',
  'Soldier Field, Chicago',
  'Soldier Field, Chicago',
];

const KO_VENUES = {
  round32: [
    'MetLife Stadium, Nova Jersey', 'MetLife Stadium, Nova Jersey',
    'SoFi Stadium, Los Angeles', 'SoFi Stadium, Los Angeles',
    'AT&T Stadium, Dallas', 'AT&T Stadium, Dallas',
    'Hard Rock Stadium, Miami', 'Hard Rock Stadium, Miami',
    "Levi's Stadium, São Francisco", "Levi's Stadium, São Francisco",
    'BC Place, Vancouver', 'BC Place, Vancouver',
    'Estádio Azteca, Cidade do México', 'Estádio Azteca, Cidade do México',
    'Allegiant Stadium, Las Vegas', 'Allegiant Stadium, Las Vegas',
  ],
  round16: [
    'MetLife Stadium, Nova Jersey', 'MetLife Stadium, Nova Jersey',
    'SoFi Stadium, Los Angeles', 'SoFi Stadium, Los Angeles',
    'AT&T Stadium, Dallas', 'AT&T Stadium, Dallas',
    'Hard Rock Stadium, Miami', 'Hard Rock Stadium, Miami',
  ],
  quarter: [
    'MetLife Stadium, Nova Jersey', 'MetLife Stadium, Nova Jersey',
    'SoFi Stadium, Los Angeles', 'SoFi Stadium, Los Angeles',
  ],
  semi: ['MetLife Stadium, Nova Jersey', 'SoFi Stadium, Los Angeles'],
  third: ['AT&T Stadium, Dallas'],
  final: ['MetLife Stadium, Nova Jersey'],
};

const round32Labels = [
  '1A', '2B', '1C', '2D', '1E', '2F', '1G', '2H',
  '1I', '2J', '1K', '2L', '1B', '2A', '1D', '2C',
  '1F', '2E', '1H', '2G', '1J', '2I', '1L', '2K',
  '3A', '3B', '3C', '3D', '3E', '3F', '3G', '3H',
];
const round16Labels = ['W73', 'W74', 'W75', 'W76', 'W77', 'W78', 'W79', 'W80', 'W81', 'W82', 'W83', 'W84', 'W85', 'W86', 'W87', 'W88'];
const quarterLabels = ['W89', 'W90', 'W91', 'W92', 'W93', 'W94', 'W95', 'W96'];
const semiLabels = ['W97', 'W98', 'W99', 'W100'];
const thirdLabels = ['L101', 'L102'];
const finalLabels = ['W101', 'W102'];

const LABEL_MAPS = {
  round32: round32Labels, round16: round16Labels,
  quarter: quarterLabels, semi: semiLabels,
  third: thirdLabels, final: finalLabels,
};

fetch('https://api.fifa.com/api/v3/calendar/matches?idCompetition=17&idSeason=285023&language=en&count=200')
  .then(r => r.json())
  .then(d => {
    let groupIdx = 0;
    let koIdx = { round32: 0, round16: 0, quarter: 0, semi: 0, third: 0, final: 0 };
    const matches = [];

    for (const m of d.Results) {
      const dt = new Date(m.Date);
      const brt = new Date(dt.getTime() - 3 * 60 * 60 * 1000);
      const day = String(brt.getUTCDate()).padStart(2, '0');
      const mon = String(brt.getUTCMonth() + 1).padStart(2, '0');
      const hh = String(brt.getUTCHours()).padStart(2, '0');
      const mm = String(brt.getUTCMinutes()).padStart(2, '0');
      const fifaStage = m.StageName?.[0]?.Description || '';
      const stage = STAGE_MAP[fifaStage] || 'group';

      const id = matches.length + 1;
      const group = stage === 'group' ? (m.GroupName?.[0]?.Description || '').replace('Group ', '') : undefined;

      let homeTeam, awayTeam, venue;

      if (stage === 'group') {
        homeTeam = F2O[m.Home?.Abbreviation];
        awayTeam = F2O[m.Away?.Abbreviation];
        venue = VENUES[groupIdx] || 'TBD';
        groupIdx++;
      } else {
        const k = stage;
        const ki = koIdx[k];
        venue = KO_VENUES[k]?.[ki] || 'TBD';
        koIdx[k]++;

        const labels = LABEL_MAPS[k];
        const idx = ki * 2;
        if (k === 'third') {
          homeTeam = labels[0] || 'TBD';
          awayTeam = labels[1] || 'TBD';
        } else {
          homeTeam = labels[idx] || 'TBD';
          awayTeam = labels[idx + 1] || 'TBD';
        }
      }

      const entry = { id };
      if (group) entry.group = group;
      entry.stage = stage;
      entry.date = day + '/' + mon;
      entry.time = hh + ':' + mm;
      entry.venue = venue;
      entry.homeTeam = homeTeam;
      entry.awayTeam = awayTeam;
      matches.push(entry);
    }

    
    matches.forEach(m => {
      const parts = [`id: ${m.id}`];
      if (m.group) parts.push(`group: '${m.group}'`);
      parts.push(`stage: '${m.stage}'`);
      parts.push(`date: '${m.date}'`);
      parts.push(`time: '${m.time}'`);
      parts.push(`venue: '${m.venue}'`);
      parts.push(`homeTeam: '${m.homeTeam}'`);
      parts.push(`awayTeam: '${m.awayTeam}'`);
      console.log('  { ' + parts.join(', ') + ' },');
    });
    console.log('];\n');
    console.log('export default matches;');
  })
  .catch(e => { console.error(e.message); process.exit(1); });
