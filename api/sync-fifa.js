import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '')

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

function parseLocalDate(str) {
  const parts = str.slice(0, 10).split('-')
  if (parts.length === 3) return `${parts[2]}/${parts[1]}`
  const d = new Date(str)
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const { default: ourMatches } = await import('../src/data/matches.js')

    const fifaRes = await fetch(FIFA_API)
    if (!fifaRes.ok) return res.json({ success: false, error: `FIFA API returned ${fifaRes.status}` })
    const data = await fifaRes.json()
    const changes = []

    for (const fm of data.Results) {
      const homeCode = fm.Home?.Abbreviation
      const awayCode = fm.Away?.Abbreviation
      const ourHome = FIFA_TO_OURS[homeCode]
      const ourAway = FIFA_TO_OURS[awayCode]
      if (!ourHome || !ourAway) continue
      const dateStr = parseLocalDate(fm.LocalDate || fm.Date)
      const match = ourMatches.find(m => m.homeTeam === ourHome && m.awayTeam === ourAway && m.date === dateStr)
      if (!match || fm.HomeTeamScore === null || fm.AwayTeamScore === null) continue

      const entry = {
        match_id: match.id,
        home_score: Number(fm.HomeTeamScore),
        away_score: Number(fm.AwayTeamScore),
        played: fm.MatchStatus === 0,
        match_time: fm.MatchTime || '',
        match_status: fm.MatchStatus,
        updated_at: new Date().toISOString(),
      }

      if (fm.IdMatch) {
        try {
          const det = await fetch(`https://api.fifa.com/api/v3/live/football/${fm.IdMatch}`)
          if (det.ok) {
            const detData = await det.json()
            const getPlayerName = (players, id) => players?.find(p => p.IdPlayer === id)?.PlayerName?.[0]?.Description || ''
            const homePlayers = detData.HomeTeam?.Players || []
            const awayPlayers = detData.AwayTeam?.Players || []
            entry.home_goals = (detData.HomeTeam?.Goals || []).map(g => ({ player: getPlayerName(homePlayers, g.IdPlayer), minute: (g.Minute || '').replace("'", '') }))
            entry.away_goals = (detData.AwayTeam?.Goals || []).map(g => ({ player: getPlayerName(awayPlayers, g.IdPlayer), minute: (g.Minute || '').replace("'", '') }))
          }
        } catch {}
      }

      changes.push(entry)
    }

    if (changes.length > 0) {
      const { error } = await supabase.from('match_results').upsert(changes, { onConflict: 'match_id' })
      if (error) return res.json({ success: false, error: error.message })
    }

    res.json({ success: true, updated: changes.length })
  } catch (err) {
    res.json({ success: false, error: err.message })
  }
}
