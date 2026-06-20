import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl || '', supabaseKey || '')

const FIFA_TO_OURS = {
  MEX:'MEXICO',RSA:'AFRICA_SUL',KOR:'COREIA_SUL',CZE:'REP_TCHECA',CAN:'CANADA',BIH:'BOSNIA',QAT:'CATAR',SUI:'SUICA',
  BRA:'BRASIL',MAR:'MARROCOS',HAI:'HAITI',SCO:'ESCOCIA',USA:'USA',PAR:'PARAGUAI',AUS:'AUSTRALIA',TUR:'TURQUIA',
  GER:'ALEMANHA',CUW:'CURACAO',CIV:'COSTA_MARFIM',ECU:'EQUADOR',NED:'HOLANDA',JPN:'JAPAO',SWE:'SUECIA',TUN:'TUNISIA',
  BEL:'BELGICA',EGY:'EGITO',IRN:'IRA',NZL:'NOVA_ZELANDIA',ESP:'ESPANHA',CPV:'CABO_VERDE',KSA:'ARABIA',URU:'URUGUAI',
  FRA:'FRANCA',SEN:'SENEGAL',IRQ:'IRAQUE',NOR:'NORUEGA',ARG:'ARGENTINA',ALG:'ARGELIA',AUT:'AUSTRIA',JOR:'JORDANIA',
  POR:'PORTUGAL',COD:'RD_CONGO',UZB:'UZBEQUISTAO',COL:'COLOMBIA',ENG:'INGLATERRA',CRO:'CROACIA',GHA:'GANA',PAN:'PANAMA',
}

// Upcoming group matches (IDs 30-72 from our MATCHES)
const OUR_MATCHES = [
  {id:1,date:'11/06/2026',home:'MEXICO',away:'AFRICA_SUL'},{id:2,date:'11/06/2026',home:'COREIA_SUL',away:'REP_TCHECA'},
  {id:3,date:'12/06/2026',home:'CANADA',away:'BOSNIA'},{id:4,date:'12/06/2026',home:'USA',away:'PARAGUAI'},
  {id:5,date:'13/06/2026',home:'CATAR',away:'SUICA'},{id:6,date:'13/06/2026',home:'BRASIL',away:'MARROCOS'},
  {id:7,date:'13/06/2026',home:'HAITI',away:'ESCOCIA'},{id:8,date:'14/06/2026',home:'AUSTRALIA',away:'TURQUIA'},
  {id:9,date:'14/06/2026',home:'ALEMANHA',away:'CURACAO'},{id:10,date:'14/06/2026',home:'HOLANDA',away:'JAPAO'},
  {id:11,date:'14/06/2026',home:'COSTA_MARFIM',away:'EQUADOR'},{id:12,date:'14/06/2026',home:'SUECIA',away:'TUNISIA'},
  {id:13,date:'15/06/2026',home:'ESPANHA',away:'CABO_VERDE'},{id:14,date:'15/06/2026',home:'BELGICA',away:'EGITO'},
  {id:15,date:'15/06/2026',home:'ARABIA',away:'URUGUAI'},{id:16,date:'15/06/2026',home:'IRA',away:'NOVA_ZELANDIA'},
  {id:17,date:'16/06/2026',home:'FRANCA',away:'SENEGAL'},{id:18,date:'16/06/2026',home:'IRAQUE',away:'NORUEGA'},
  {id:19,date:'16/06/2026',home:'ARGENTINA',away:'ARGELIA'},{id:20,date:'17/06/2026',home:'AUSTRIA',away:'JORDANIA'},
  {id:21,date:'17/06/2026',home:'PORTUGAL',away:'RD_CONGO'},{id:22,date:'17/06/2026',home:'INGLATERRA',away:'CROACIA'},
  {id:23,date:'17/06/2026',home:'GANA',away:'PANAMA'},{id:24,date:'17/06/2026',home:'UZBEQUISTAO',away:'COLOMBIA'},
  {id:25,date:'18/06/2026',home:'REP_TCHECA',away:'AFRICA_SUL'},{id:26,date:'18/06/2026',home:'SUICA',away:'BOSNIA'},
  {id:27,date:'18/06/2026',home:'CANADA',away:'CATAR'},{id:28,date:'18/06/2026',home:'MEXICO',away:'COREIA_SUL'},
  {id:29,date:'19/06/2026',home:'USA',away:'AUSTRALIA'},{id:30,date:'19/06/2026',home:'ESCOCIA',away:'MARROCOS'},
  {id:32,date:'20/06/2026',home:'TURQUIA',away:'PARAGUAI'},{id:33,date:'20/06/2026',home:'HOLANDA',away:'SUECIA'},
  {id:34,date:'20/06/2026',home:'ALEMANHA',away:'COSTA_MARFIM'},{id:35,date:'20/06/2026',home:'EQUADOR',away:'CURACAO'},
  {id:36,date:'21/06/2026',home:'TUNISIA',away:'JAPAO'},{id:37,date:'21/06/2026',home:'ESPANHA',away:'ARABIA'},
  {id:38,date:'21/06/2026',home:'BELGICA',away:'IRA'},{id:39,date:'21/06/2026',home:'URUGUAI',away:'CABO_VERDE'},
  {id:40,date:'21/06/2026',home:'NOVA_ZELANDIA',away:'EGITO'},{id:41,date:'22/06/2026',home:'ARGENTINA',away:'AUSTRIA'},
  {id:42,date:'22/06/2026',home:'FRANCA',away:'IRAQUE'},{id:43,date:'22/06/2026',home:'NORUEGA',away:'SENEGAL'},
  {id:44,date:'23/06/2026',home:'JORDANIA',away:'ARGELIA'},{id:45,date:'23/06/2026',home:'PORTUGAL',away:'UZBEQUISTAO'},
  {id:46,date:'23/06/2026',home:'INGLATERRA',away:'GANA'},{id:47,date:'23/06/2026',home:'PANAMA',away:'CROACIA'},
  {id:48,date:'23/06/2026',home:'COLOMBIA',away:'RD_CONGO'},{id:49,date:'24/06/2026',home:'BOSNIA',away:'CATAR'},
  {id:50,date:'24/06/2026',home:'SUICA',away:'CANADA'},{id:51,date:'24/06/2026',home:'MARROCOS',away:'HAITI'},
  {id:52,date:'24/06/2026',home:'ESCOCIA',away:'BRASIL'},{id:53,date:'24/06/2026',home:'AFRICA_SUL',away:'COREIA_SUL'},
  {id:54,date:'24/06/2026',home:'REP_TCHECA',away:'MEXICO'},{id:55,date:'25/06/2026',home:'CURACAO',away:'COSTA_MARFIM'},
  {id:56,date:'25/06/2026',home:'EQUADOR',away:'ALEMANHA'},{id:57,date:'25/06/2026',home:'TUNISIA',away:'HOLANDA'},
  {id:58,date:'25/06/2026',home:'JAPAO',away:'SUECIA'},{id:59,date:'25/06/2026',home:'PARAGUAI',away:'AUSTRALIA'},
  {id:60,date:'25/06/2026',home:'TURQUIA',away:'USA'},{id:61,date:'26/06/2026',home:'SENEGAL',away:'IRAQUE'},
  {id:62,date:'26/06/2026',home:'NORUEGA',away:'FRANCA'},{id:63,date:'26/06/2026',home:'URUGUAI',away:'ESPANHA'},
  {id:64,date:'26/06/2026',home:'CABO_VERDE',away:'ARABIA'},{id:65,date:'27/06/2026',home:'NOVA_ZELANDIA',away:'BELGICA'},
  {id:66,date:'27/06/2026',home:'EGITO',away:'IRA'},{id:67,date:'27/06/2026',home:'PANAMA',away:'INGLATERRA'},
  {id:68,date:'27/06/2026',home:'CROACIA',away:'GANA'},{id:69,date:'27/06/2026',home:'RD_CONGO',away:'UZBEQUISTAO'},
  {id:70,date:'27/06/2026',home:'COLOMBIA',away:'PORTUGAL'},{id:71,date:'27/06/2026',home:'ARGELIA',away:'AUSTRIA'},
  {id:72,date:'27/06/2026',home:'JORDANIA',away:'ARGENTINA'}
]

function parseLocalDate(str) {
  const d = new Date(str)
  d.setHours(d.getHours() - 3)
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`
}

function getPlayerName(p) {
  return p.PlayerName?.[0]?.Description || p.ShortName?.[0]?.Description || '?'
}

async function fetchFifa(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'copa2026/1.0' } })
  if (!res.ok) return null
  return res.json()
}

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'public, max-age=120')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    // 1. Get FIFA calendar to find match IDs
    const cal = await fetchFifa('https://api.fifa.com/api/v3/calendar/matches?idCompetition=17&idSeason=285023&language=en&count=200')
    if (!cal) return res.json({ error: 'FIFA indisponivel', lineups: [] })

    // 2. Build map of FIFA match IDs to our match IDs
    const matchMap = {}
    for (const fm of cal.Results) {
      const hc = fm.Home?.Abbreviation, ac = fm.Away?.Abbreviation
      if (!hc || !ac) continue
      const oh = FIFA_TO_OURS[hc], oa = FIFA_TO_OURS[ac]
      if (!oh || !oa) continue
      const ds = parseLocalDate(fm.Date)
      const m = OUR_MATCHES.find(x => x.home === oh && x.away === oa && x.date === ds)
      if (m) matchMap[fm.IdMatch] = { ourId: m.id, home: oh, away: oa, date: m.date, homeCode: hc, awayCode: ac, time: fm.MatchTime || '', status: Number(fm.MatchStatus), kickoff: fm.Date }
    }

    // 3. Fetch lineups for each match (limit to avoid rate limiting)
    const lineups = []
    const ids = Object.keys(matchMap)
    const toFetch = ids

    for (const idMatch of toFetch) {
      const info = matchMap[idMatch]
      const live = await fetchFifa(`https://api.fifa.com/api/v3/live/football/${idMatch}`)
      if (!live) {
        lineups.push({ matchId: info.ourId, homeTeam: info.home, awayTeam: info.away, date: info.date, status: info.status, hasLineup: false })
        continue
      }

      const getPlayers = (team) => {
        if (!team?.Players) return { starting: [], substitutes: [], formation: team?.Formation || '' }
        const all = team.Players.map(p => ({
          name: getPlayerName(p),
          shirt: p.ShirtNumber || '',
          position: p.Position || '',
          captain: p.Captain || false,
          fieldStatus: p.FieldStatus || 0
        }))
        return {
          starting: all.filter(p => p.fieldStatus === 1).sort((a, b) => (a.position || '').localeCompare(b.position || '')),
          substitutes: all.filter(p => p.fieldStatus !== 1),
          formation: team.Formation || ''
        }
      }

      const homeLineup = getPlayers(live.HomeTeam)
      const awayLineup = getPlayers(live.AwayTeam)

      lineups.push({
        matchId: info.ourId,
        homeTeam: info.home,
        awayTeam: info.away,
        date: info.date,
        status: info.status,
        homeCode: info.homeCode,
        awayCode: info.awayCode,
        hasLineup: homeLineup.starting.length > 0 || awayLineup.starting.length > 0,
        home: homeLineup,
        away: awayLineup,
        stadium: live.Stadium?.Name?.[0]?.Description || '',
        weather: live.Weather || null
      })
    }

    res.json({ lineups, updated: new Date().toISOString() })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
