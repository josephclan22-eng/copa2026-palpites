import express from 'express'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl || '', supabaseKey || '')

const PORT = process.env.PORT || 3001
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
  const d = new Date(str)
  d.setHours(d.getHours() - 3)
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`
}

async function syncFifa() {
  try {
    const matchesPath = join(__dirname, '..', 'src', 'data', 'matches.js')
    const content = readFileSync(matchesPath, 'utf8')
    const arr = content.match(/\[[\s\S]*\]/)?.[0]
    if (!arr) return
    const ourMatches = eval(`(${arr})`)

    const res = await fetch(FIFA_API)
    if (!res.ok) return
    const data = await res.json()
    const changes = []

    for (const fm of data.Results) {
      const homeCode = fm.Home?.Abbreviation
      const awayCode = fm.Away?.Abbreviation
      const ourHome = FIFA_TO_OURS[homeCode]
      const ourAway = FIFA_TO_OURS[awayCode]
      if (!ourHome || !ourAway) continue
      const dateStr = parseLocalDate(fm.Date)
      const match = ourMatches.find(m => m.homeTeam === ourHome && m.awayTeam === ourAway && m.date === dateStr)
      if (!match) continue
      const ms = Number(fm.MatchStatus)
      changes.push({
        match_id: match.id,
        home_score: fm.HomeTeamScore !== null ? Number(fm.HomeTeamScore) : null,
        away_score: fm.AwayTeamScore !== null ? Number(fm.AwayTeamScore) : null,
        match_status: isNaN(ms) ? 1 : ms,
        match_time: fm.MatchTime || '',
        played: ms === 0,
        updated_at: new Date().toISOString(),
      })
    }

    if (changes.length > 0) {
      await supabase.from('match_results').upsert(changes, { onConflict: 'match_id' })
      console.log(`[${new Date().toLocaleTimeString('pt-BR')}] Sync: ${changes.length} resultados`)
    }
  } catch {}
}

const app = express()

app.get('/api/sync', async (req, res) => {
  await syncFifa()
  res.json({ success: true })
})

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() })
})

syncFifa()
setInterval(syncFifa, 30000)

app.listen(PORT, () => console.log(`Sync server on port ${PORT}`))
