import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl || '', supabaseKey || '')

const FIFA_API = 'https://api.fifa.com/api/v3/calendar/matches?idCompetition=17&idSeason=285023&language=en&count=200'

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
}

// ===== PARTIDAS EMBUTIDAS (evita erro de dynamic import no Vercel) =====
const OUR_MATCHES = [
  { id: 1, group: 'A', stage: 'group', date: '11/06/2026', time: '16:00', venue: 'Estádio Azteca, Cidade do México', homeTeam: 'MEXICO', awayTeam: 'AFRICA_SUL' },
  { id: 2, group: 'A', stage: 'group', date: '11/06/2026', time: '23:00', venue: 'Estádio Azteca, Cidade do México', homeTeam: 'COREIA_SUL', awayTeam: 'REP_TCHECA' },
  { id: 3, group: 'B', stage: 'group', date: '12/06/2026', time: '16:00', venue: 'BC Place, Vancouver', homeTeam: 'CANADA', awayTeam: 'BOSNIA' },
  { id: 4, group: 'D', stage: 'group', date: '12/06/2026', time: '22:00', venue: 'SoFi Stadium, Los Angeles', homeTeam: 'USA', awayTeam: 'PARAGUAI' },
  { id: 5, group: 'B', stage: 'group', date: '13/06/2026', time: '16:00', venue: 'BC Place, Vancouver', homeTeam: 'CATAR', awayTeam: 'SUICA' },
  { id: 6, group: 'C', stage: 'group', date: '13/06/2026', time: '19:00', venue: 'MetLife Stadium, Nova Jersey', homeTeam: 'BRASIL', awayTeam: 'MARROCOS' },
  { id: 7, group: 'C', stage: 'group', date: '13/06/2026', time: '22:00', venue: 'MetLife Stadium, Nova Jersey', homeTeam: 'HAITI', awayTeam: 'ESCOCIA' },
  { id: 8, group: 'D', stage: 'group', date: '14/06/2026', time: '01:00', venue: 'SoFi Stadium, Los Angeles', homeTeam: 'AUSTRALIA', awayTeam: 'TURQUIA' },
  { id: 9, group: 'E', stage: 'group', date: '14/06/2026', time: '14:00', venue: 'Mercedes-Benz Stadium, Atlanta', homeTeam: 'ALEMANHA', awayTeam: 'CURACAO' },
  { id: 10, group: 'F', stage: 'group', date: '14/06/2026', time: '17:00', venue: 'AT&T Stadium, Dallas', homeTeam: 'HOLANDA', awayTeam: 'JAPAO' },
  { id: 11, group: 'E', stage: 'group', date: '14/06/2026', time: '20:00', venue: 'Mercedes-Benz Stadium, Atlanta', homeTeam: 'COSTA_MARFIM', awayTeam: 'EQUADOR' },
  { id: 12, group: 'F', stage: 'group', date: '14/06/2026', time: '23:00', venue: 'AT&T Stadium, Dallas', homeTeam: 'SUECIA', awayTeam: 'TUNISIA' },
  { id: 13, group: 'H', stage: 'group', date: '15/06/2026', time: '13:00', venue: 'Estádio Akron, Guadalajara', homeTeam: 'ESPANHA', awayTeam: 'CABO_VERDE' },
  { id: 14, group: 'G', stage: 'group', date: '15/06/2026', time: '16:00', venue: 'Lincoln Financial Field, Filadélfia', homeTeam: 'BELGICA', awayTeam: 'EGITO' },
  { id: 15, group: 'H', stage: 'group', date: '15/06/2026', time: '19:00', venue: 'Estádio Akron, Guadalajara', homeTeam: 'ARABIA', awayTeam: 'URUGUAI' },
  { id: 16, group: 'G', stage: 'group', date: '15/06/2026', time: '22:00', venue: 'Lincoln Financial Field, Filadélfia', homeTeam: 'IRA', awayTeam: 'NOVA_ZELANDIA' },
  { id: 17, group: 'I', stage: 'group', date: '16/06/2026', time: '16:00', venue: 'BMO Field, Toronto', homeTeam: 'FRANCA', awayTeam: 'SENEGAL' },
  { id: 18, group: 'I', stage: 'group', date: '16/06/2026', time: '19:00', venue: 'BMO Field, Toronto', homeTeam: 'IRAQUE', awayTeam: 'NORUEGA' },
  { id: 19, group: 'J', stage: 'group', date: '16/06/2026', time: '22:00', venue: 'Arrowhead Stadium, Kansas City', homeTeam: 'ARGENTINA', awayTeam: 'ARGELIA' },
  { id: 20, group: 'J', stage: 'group', date: '17/06/2026', time: '01:00', venue: 'Arrowhead Stadium, Kansas City', homeTeam: 'AUSTRIA', awayTeam: 'JORDANIA' },
  { id: 21, group: 'K', stage: 'group', date: '17/06/2026', time: '14:00', venue: 'CenturyLink Field, Seattle', homeTeam: 'PORTUGAL', awayTeam: 'RD_CONGO' },
  { id: 22, group: 'L', stage: 'group', date: '17/06/2026', time: '17:00', venue: 'BMO Field, Toronto', homeTeam: 'INGLATERRA', awayTeam: 'CROACIA' },
  { id: 23, group: 'L', stage: 'group', date: '17/06/2026', time: '20:00', venue: 'Commonwealth Stadium, Edmonton', homeTeam: 'GANA', awayTeam: 'PANAMA' },
  { id: 24, group: 'K', stage: 'group', date: '17/06/2026', time: '23:00', venue: 'CenturyLink Field, Seattle', homeTeam: 'UZBEQUISTAO', awayTeam: 'COLOMBIA' },
  { id: 25, group: 'A', stage: 'group', date: '18/06/2026', time: '13:00', venue: 'Estádio BBVA, Monterrey', homeTeam: 'REP_TCHECA', awayTeam: 'AFRICA_SUL' },
  { id: 26, group: 'B', stage: 'group', date: '18/06/2026', time: '16:00', venue: 'Commonwealth Stadium, Edmonton', homeTeam: 'SUICA', awayTeam: 'BOSNIA' },
  { id: 27, group: 'B', stage: 'group', date: '18/06/2026', time: '19:00', venue: 'BC Place, Vancouver', homeTeam: 'CANADA', awayTeam: 'CATAR' },
  { id: 28, group: 'A', stage: 'group', date: '18/06/2026', time: '22:00', venue: 'Estádio BBVA, Monterrey', homeTeam: 'MEXICO', awayTeam: 'COREIA_SUL' },
  { id: 29, group: 'D', stage: 'group', date: '19/06/2026', time: '16:00', venue: "Levi's Stadium, São Francisco", homeTeam: 'USA', awayTeam: 'AUSTRALIA' },
  { id: 30, group: 'C', stage: 'group', date: '19/06/2026', time: '19:00', venue: 'Gillette Stadium, Boston', homeTeam: 'ESCOCIA', awayTeam: 'MARROCOS' },
  { id: 31, group: 'C', stage: 'group', date: '19/06/2026', time: '21:30', venue: 'Gillette Stadium, Boston', homeTeam: 'BRASIL', awayTeam: 'HAITI' },
  { id: 32, group: 'D', stage: 'group', date: '20/06/2026', time: '00:00', venue: 'NRG Stadium, Houston', homeTeam: 'TURQUIA', awayTeam: 'PARAGUAI' },
  { id: 33, group: 'F', stage: 'group', date: '20/06/2026', time: '14:00', venue: 'NRG Stadium, Houston', homeTeam: 'HOLANDA', awayTeam: 'SUECIA' },
  { id: 34, group: 'E', stage: 'group', date: '20/06/2026', time: '17:00', venue: 'Hard Rock Stadium, Miami', homeTeam: 'ALEMANHA', awayTeam: 'COSTA_MARFIM' },
  { id: 35, group: 'E', stage: 'group', date: '20/06/2026', time: '21:00', venue: 'Hard Rock Stadium, Miami', homeTeam: 'EQUADOR', awayTeam: 'CURACAO' },
  { id: 36, group: 'F', stage: 'group', date: '21/06/2026', time: '01:00', venue: 'NRG Stadium, Houston', homeTeam: 'TUNISIA', awayTeam: 'JAPAO' },
  { id: 37, group: 'H', stage: 'group', date: '21/06/2026', time: '13:00', venue: 'Estádio Universitário, Cidade do México', homeTeam: 'ESPANHA', awayTeam: 'ARABIA' },
  { id: 38, group: 'G', stage: 'group', date: '21/06/2026', time: '16:00', venue: 'M&T Bank Stadium, Baltimore', homeTeam: 'BELGICA', awayTeam: 'IRA' },
  { id: 39, group: 'H', stage: 'group', date: '21/06/2026', time: '19:00', venue: 'Estádio Universitário, Cidade do México', homeTeam: 'URUGUAI', awayTeam: 'CABO_VERDE' },
  { id: 40, group: 'G', stage: 'group', date: '21/06/2026', time: '22:00', venue: 'M&T Bank Stadium, Baltimore', homeTeam: 'NOVA_ZELANDIA', awayTeam: 'EGITO' },
  { id: 41, group: 'J', stage: 'group', date: '22/06/2026', time: '14:00', venue: 'Soldier Field, Chicago', homeTeam: 'ARGENTINA', awayTeam: 'AUSTRIA' },
  { id: 42, group: 'I', stage: 'group', date: '22/06/2026', time: '18:00', venue: 'BC Place, Vancouver', homeTeam: 'FRANCA', awayTeam: 'IRAQUE' },
  { id: 43, group: 'I', stage: 'group', date: '22/06/2026', time: '21:00', venue: 'BC Place, Vancouver', homeTeam: 'NORUEGA', awayTeam: 'SENEGAL' },
  { id: 44, group: 'J', stage: 'group', date: '23/06/2026', time: '00:00', venue: 'Soldier Field, Chicago', homeTeam: 'JORDANIA', awayTeam: 'ARGELIA' },
  { id: 45, group: 'K', stage: 'group', date: '23/06/2026', time: '14:00', venue: 'Allegiant Stadium, Las Vegas', homeTeam: 'PORTUGAL', awayTeam: 'UZBEQUISTAO' },
  { id: 46, group: 'L', stage: 'group', date: '23/06/2026', time: '17:00', venue: 'Commonwealth Stadium, Edmonton', homeTeam: 'INGLATERRA', awayTeam: 'GANA' },
  { id: 47, group: 'L', stage: 'group', date: '23/06/2026', time: '20:00', venue: 'Commonwealth Stadium, Edmonton', homeTeam: 'PANAMA', awayTeam: 'CROACIA' },
  { id: 48, group: 'K', stage: 'group', date: '23/06/2026', time: '23:00', venue: 'Allegiant Stadium, Las Vegas', homeTeam: 'COLOMBIA', awayTeam: 'RD_CONGO' },
  { id: 49, group: 'B', stage: 'group', date: '24/06/2026', time: '16:00', venue: 'BC Place, Vancouver', homeTeam: 'BOSNIA', awayTeam: 'CATAR' },
  { id: 50, group: 'B', stage: 'group', date: '24/06/2026', time: '16:00', venue: 'BC Place, Vancouver', homeTeam: 'SUICA', awayTeam: 'CANADA' },
  { id: 51, group: 'C', stage: 'group', date: '24/06/2026', time: '19:00', venue: 'MetLife Stadium, Nova Jersey', homeTeam: 'MARROCOS', awayTeam: 'HAITI' },
  { id: 52, group: 'C', stage: 'group', date: '24/06/2026', time: '19:00', venue: 'MetLife Stadium, Nova Jersey', homeTeam: 'ESCOCIA', awayTeam: 'BRASIL' },
  { id: 53, group: 'A', stage: 'group', date: '24/06/2026', time: '22:00', venue: 'Estádio Azteca, Cidade do México', homeTeam: 'AFRICA_SUL', awayTeam: 'COREIA_SUL' },
  { id: 54, group: 'A', stage: 'group', date: '24/06/2026', time: '22:00', venue: 'Estádio Azteca, Cidade do México', homeTeam: 'REP_TCHECA', awayTeam: 'MEXICO' },
  { id: 55, group: 'E', stage: 'group', date: '25/06/2026', time: '17:00', venue: 'Hard Rock Stadium, Miami', homeTeam: 'CURACAO', awayTeam: 'COSTA_MARFIM' },
  { id: 56, group: 'E', stage: 'group', date: '25/06/2026', time: '17:00', venue: 'Hard Rock Stadium, Miami', homeTeam: 'EQUADOR', awayTeam: 'ALEMANHA' },
  { id: 57, group: 'F', stage: 'group', date: '25/06/2026', time: '20:00', venue: 'AT&T Stadium, Dallas', homeTeam: 'TUNISIA', awayTeam: 'HOLANDA' },
  { id: 58, group: 'F', stage: 'group', date: '25/06/2026', time: '20:00', venue: 'AT&T Stadium, Dallas', homeTeam: 'JAPAO', awayTeam: 'SUECIA' },
  { id: 59, group: 'D', stage: 'group', date: '25/06/2026', time: '23:00', venue: "Levi's Stadium, São Francisco", homeTeam: 'PARAGUAI', awayTeam: 'AUSTRALIA' },
  { id: 60, group: 'D', stage: 'group', date: '25/06/2026', time: '23:00', venue: "Levi's Stadium, São Francisco", homeTeam: 'TURQUIA', awayTeam: 'USA' },
  { id: 61, group: 'I', stage: 'group', date: '26/06/2026', time: '16:00', venue: 'BMO Field, Toronto', homeTeam: 'SENEGAL', awayTeam: 'IRAQUE' },
  { id: 62, group: 'I', stage: 'group', date: '26/06/2026', time: '16:00', venue: 'BMO Field, Toronto', homeTeam: 'NORUEGA', awayTeam: 'FRANCA' },
  { id: 63, group: 'H', stage: 'group', date: '26/06/2026', time: '21:00', venue: 'Estádio Universitário, Cidade do México', homeTeam: 'URUGUAI', awayTeam: 'ESPANHA' },
  { id: 64, group: 'H', stage: 'group', date: '26/06/2026', time: '21:00', venue: 'Estádio Universitário, Cidade do México', homeTeam: 'CABO_VERDE', awayTeam: 'ARABIA' },
  { id: 65, group: 'G', stage: 'group', date: '27/06/2026', time: '00:00', venue: 'M&T Bank Stadium, Baltimore', homeTeam: 'NOVA_ZELANDIA', awayTeam: 'BELGICA' },
  { id: 66, group: 'G', stage: 'group', date: '27/06/2026', time: '00:00', venue: 'M&T Bank Stadium, Baltimore', homeTeam: 'EGITO', awayTeam: 'IRA' },
  { id: 67, group: 'L', stage: 'group', date: '27/06/2026', time: '18:00', venue: 'BMO Field, Toronto', homeTeam: 'PANAMA', awayTeam: 'INGLATERRA' },
  { id: 68, group: 'L', stage: 'group', date: '27/06/2026', time: '18:00', venue: 'BMO Field, Toronto', homeTeam: 'CROACIA', awayTeam: 'GANA' },
  { id: 69, group: 'K', stage: 'group', date: '27/06/2026', time: '20:30', venue: 'Allegiant Stadium, Las Vegas', homeTeam: 'RD_CONGO', awayTeam: 'UZBEQUISTAO' },
  { id: 70, group: 'K', stage: 'group', date: '27/06/2026', time: '20:30', venue: 'Allegiant Stadium, Las Vegas', homeTeam: 'COLOMBIA', awayTeam: 'PORTUGAL' },
  { id: 71, group: 'J', stage: 'group', date: '27/06/2026', time: '23:00', venue: 'Soldier Field, Chicago', homeTeam: 'ARGELIA', awayTeam: 'AUSTRIA' },
  { id: 72, group: 'J', stage: 'group', date: '27/06/2026', time: '23:00', venue: 'Soldier Field, Chicago', homeTeam: 'JORDANIA', awayTeam: 'ARGENTINA' },
  { id: 73, group: '', stage: 'round32', date: '28/06/2026', time: '16:00', venue: 'NRG Stadium, Houston', homeTeam: 'AFRICA_SUL', awayTeam: 'CANADA' },
  { id: 74, group: '', stage: 'round32', date: '29/06/2026', time: '14:00', venue: 'NRG Stadium, Houston', homeTeam: 'BRASIL', awayTeam: 'JAPAO' },
  { id: 75, group: '', stage: 'round32', date: '29/06/2026', time: '17:30', venue: 'SoFi Stadium, Los Angeles', homeTeam: 'ALEMANHA', awayTeam: 'PARAGUAI' },
  { id: 76, group: '', stage: 'round32', date: '29/06/2026', time: '22:00', venue: 'SoFi Stadium, Los Angeles', homeTeam: 'HOLANDA', awayTeam: 'MARROCOS' },
  { id: 77, group: '', stage: 'round32', date: '30/06/2026', time: '14:00', venue: 'AT&T Stadium, Dallas', homeTeam: 'COSTA_MARFIM', awayTeam: 'NORUEGA' },
  { id: 78, group: '', stage: 'round32', date: '30/06/2026', time: '18:00', venue: 'AT&T Stadium, Dallas', homeTeam: 'FRANCA', awayTeam: 'SUECIA' },
  { id: 79, group: '', stage: 'round32', date: '30/06/2026', time: '22:00', venue: 'Hard Rock Stadium, Miami', homeTeam: 'MEXICO', awayTeam: 'EQUADOR' },
  { id: 80, group: '', stage: 'round32', date: '01/07/2026', time: '13:00', venue: 'Hard Rock Stadium, Miami', homeTeam: 'INGLATERRA', awayTeam: 'RD_CONGO' },
  { id: 81, group: '', stage: 'round32', date: '01/07/2026', time: '17:00', venue: "Levi's Stadium, São Francisco", homeTeam: 'BELGICA', awayTeam: 'SENEGAL' },
  { id: 82, group: '', stage: 'round32', date: '01/07/2026', time: '21:00', venue: "Levi's Stadium, São Francisco", homeTeam: 'USA', awayTeam: 'BOSNIA' },
  { id: 83, group: '', stage: 'round32', date: '02/07/2026', time: '16:00', venue: 'BC Place, Vancouver', homeTeam: 'ESPANHA', awayTeam: 'AUSTRIA' },
  { id: 84, group: '', stage: 'round32', date: '02/07/2026', time: '20:00', venue: 'BC Place, Vancouver', homeTeam: 'PORTUGAL', awayTeam: 'CROACIA' },
  { id: 85, group: '', stage: 'round32', date: '03/07/2026', time: '00:00', venue: 'Estádio Azteca, Cidade do México', homeTeam: 'SUICA', awayTeam: 'ARGELIA' },
  { id: 86, group: '', stage: 'round32', date: '03/07/2026', time: '15:00', venue: 'Estádio Azteca, Cidade do México', homeTeam: 'AUSTRALIA', awayTeam: 'EGITO' },
  { id: 87, group: '', stage: 'round32', date: '03/07/2026', time: '19:00', venue: 'Allegiant Stadium, Las Vegas', homeTeam: 'ARGENTINA', awayTeam: 'CABO_VERDE' },
  { id: 88, group: '', stage: 'round32', date: '03/07/2026', time: '22:30', venue: 'Allegiant Stadium, Las Vegas', homeTeam: 'COLOMBIA', awayTeam: 'GANA' },
  { id: 89, group: '', stage: 'round16', date: '04/07/2026', time: '14:00', venue: 'MetLife Stadium, Nova Jersey', homeTeam: 'W73', awayTeam: 'W74' },
  { id: 90, group: '', stage: 'round16', date: '04/07/2026', time: '18:00', venue: 'MetLife Stadium, Nova Jersey', homeTeam: 'W75', awayTeam: 'W76' },
  { id: 91, group: '', stage: 'round16', date: '05/07/2026', time: '17:00', venue: 'SoFi Stadium, Los Angeles', homeTeam: 'W77', awayTeam: 'W78' },
  { id: 92, group: '', stage: 'round16', date: '05/07/2026', time: '21:00', venue: 'SoFi Stadium, Los Angeles', homeTeam: 'W79', awayTeam: 'W80' },
  { id: 93, group: '', stage: 'round16', date: '06/07/2026', time: '16:00', venue: 'AT&T Stadium, Dallas', homeTeam: 'W81', awayTeam: 'W82' },
  { id: 94, group: '', stage: 'round16', date: '06/07/2026', time: '21:00', venue: 'AT&T Stadium, Dallas', homeTeam: 'W83', awayTeam: 'W84' },
  { id: 95, group: '', stage: 'round16', date: '07/07/2026', time: '13:00', venue: 'Hard Rock Stadium, Miami', homeTeam: 'W85', awayTeam: 'W86' },
  { id: 96, group: '', stage: 'round16', date: '07/07/2026', time: '17:00', venue: 'Hard Rock Stadium, Miami', homeTeam: 'W87', awayTeam: 'W88' },
  { id: 97, group: '', stage: 'quarter', date: '09/07/2026', time: '17:00', venue: 'MetLife Stadium, Nova Jersey', homeTeam: 'W89', awayTeam: 'W90' },
  { id: 98, group: '', stage: 'quarter', date: '10/07/2026', time: '16:00', venue: 'MetLife Stadium, Nova Jersey', homeTeam: 'W91', awayTeam: 'W92' },
  { id: 99, group: '', stage: 'quarter', date: '11/07/2026', time: '18:00', venue: 'SoFi Stadium, Los Angeles', homeTeam: 'W93', awayTeam: 'W94' },
  { id: 100, group: '', stage: 'quarter', date: '11/07/2026', time: '22:00', venue: 'SoFi Stadium, Los Angeles', homeTeam: 'W95', awayTeam: 'W96' },
  { id: 101, group: '', stage: 'semi', date: '14/07/2026', time: '16:00', venue: 'MetLife Stadium, Nova Jersey', homeTeam: 'W97', awayTeam: 'W98' },
  { id: 102, group: '', stage: 'semi', date: '15/07/2026', time: '16:00', venue: 'SoFi Stadium, Los Angeles', homeTeam: 'W99', awayTeam: 'W100' },
  { id: 103, group: '', stage: 'third', date: '18/07/2026', time: '18:00', venue: 'AT&T Stadium, Dallas', homeTeam: 'L101', awayTeam: 'L102' },
  { id: 104, group: '', stage: 'final', date: '19/07/2026', time: '16:00', venue: 'MetLife Stadium, Nova Jersey', homeTeam: 'W101', awayTeam: 'W102' },
]

function parseLocalDate(str) {
  const d = new Date(str)
  d.setHours(d.getHours() - 3)
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`
}

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const log = { errors: [], steps: [] }

  try {
    // 1. Buscar dados da API FIFA
    log.steps.push('fetching FIFA API')
    const fifaRes = await fetch(FIFA_API)
    if (!fifaRes.ok) {
      console.error(`[sync-fifa] FIFA API error: ${fifaRes.status}`)
      return res.json({ success: false, error: `FIFA API returned ${fifaRes.status}`, log })
    }
    const data = await fifaRes.json()
    log.steps.push(`FIFA returned ${data.Results?.length || 0} matches`)

    // 2. Mapear partidas FIFA para nossos IDs
    const changes = []
    for (const fm of data.Results) {
      const homeCode = fm.Home?.Abbreviation
      const awayCode = fm.Away?.Abbreviation
      if (!homeCode || !awayCode) continue

      const ourHome = FIFA_TO_OURS[homeCode]
      const ourAway = FIFA_TO_OURS[awayCode]
      if (!ourHome || !ourAway) continue

      const dateStr = parseLocalDate(fm.Date)
      const match = OUR_MATCHES.find(
        m => m.stage === 'group' && m.homeTeam === ourHome && m.awayTeam === ourAway && m.date === dateStr
      )
      if (!match) {
        // Tenta match sem filtrar por stage (para fases eliminatórias)
        const matchAny = OUR_MATCHES.find(
          m => m.homeTeam === ourHome && m.awayTeam === ourAway && m.date === dateStr
        )
        if (!matchAny) continue
      }

      const targetMatch = match || OUR_MATCHES.find(
        m => m.homeTeam === ourHome && m.awayTeam === ourAway && m.date === dateStr
      )
      if (!targetMatch) continue

      const ms = Number(fm.MatchStatus)
      const hasScore = fm.HomeTeamScore !== null && fm.AwayTeamScore !== null

      changes.push({
        match_id: targetMatch.id,
        home_score: hasScore ? Number(fm.HomeTeamScore) : null,
        away_score: hasScore ? Number(fm.AwayTeamScore) : null,
        match_status: isNaN(ms) ? 1 : ms,
        match_time: fm.MatchTime || '',
        played: hasScore,
        updated_at: new Date().toISOString(),
      })
    }

    log.steps.push(`${changes.length} matches mapped`)

    // 3. Upsert no Supabase
    if (changes.length > 0) {
      log.steps.push('upserting to Supabase')
      const { error } = await supabase
        .from('match_results')
        .upsert(changes, { onConflict: 'match_id' })

      if (error) {
        console.error(`[sync-fifa] Supabase upsert error:`, error.message, error.details)
        log.errors.push(`Supabase upsert: ${error.message}`)
        return res.json({ success: false, error: error.message, log })
      }

      log.steps.push(`upserted ${changes.length} rows`)
    }

    console.log(`[sync-fifa] OK - ${changes.length} matches synced`)
    return res.json({
      success: true,
      synced: changes.length,
      lastSync: new Date().toISOString(),
      log,
    })
  } catch (err) {
    console.error(`[sync-fifa] Unexpected error:`, err.message)
    return res.json({
      success: false,
      error: err.message,
      log: { ...log, fatalError: err.message },
    })
  }
}
