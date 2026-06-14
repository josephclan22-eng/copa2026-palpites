import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '..', '.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY
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

function parseLocalDate(str) {
  const parts = str.slice(0, 10).split('-')
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
  const d = new Date(str)
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`
}

async function fetchFifaData() {
  const res = await fetch(FIFA_API)
  if (!res.ok) throw new Error(`FIFA API returned ${res.status}`)
  return res.json()
}

async function fetchMatchGoals(idMatch) {
  try {
    const res = await fetch(`https://api.fifa.com/api/v3/live/football/${idMatch}`)
    if (!res.ok) return null
    const data = await res.json()

    const goals = []
    const playerMap = {}

    if (data.HomeTeam?.Players) {
      for (const p of data.HomeTeam.Players) {
        const name = p.PlayerName?.[0]?.Description || p.ShortName?.[0]?.Description || ''
        if (name) playerMap[p.IdPlayer] = name
      }
    }
    if (data.AwayTeam?.Players) {
      for (const p of data.AwayTeam.Players) {
        const name = p.PlayerName?.[0]?.Description || p.ShortName?.[0]?.Description || ''
        if (name) playerMap[p.IdPlayer] = name
      }
    }

    if (data.HomeTeam?.Goals) {
      for (const g of data.HomeTeam.Goals) {
        goals.push({
          team: 'home',
          minute: g.Minute?.replace(/'/g, '') || '',
          player: playerMap[g.IdPlayer] || g.IdPlayer,
          type: g.Type,
        })
      }
    }
    if (data.AwayTeam?.Goals) {
      for (const g of data.AwayTeam.Goals) {
        goals.push({
          team: 'away',
          minute: g.Minute?.replace(/'/g, '') || '',
          player: playerMap[g.IdPlayer] || g.IdPlayer,
          type: g.Type,
        })
      }
    }

    goals.sort((a, b) => parseInt(a.minute || '0') - parseInt(b.minute || '0'))
    return goals.length > 0 ? JSON.stringify(goals) : ''
  } catch {
    return null
  }
}

async function refreshSync() {
  try {
    const matchesPath = join(__dirname, '..', 'src', 'data', 'matches.js')
    const matchesContent = readFileSync(matchesPath, 'utf8')
    const matchExport = matchesContent.match(/\[[\s\S]*\]/)?.[0]
    if (!matchExport) throw new Error('Could not parse matches file')
    const ourMatches = eval(`(${matchExport})`)

    const data = await fetchFifaData()
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

      const matchStatus = Number(fm.MatchStatus)
      const played = matchStatus === 0

      changes.push({
        match_id: match.id,
        home_score: fm.HomeTeamScore !== null ? Number(fm.HomeTeamScore) : null,
        away_score: fm.AwayTeamScore !== null ? Number(fm.AwayTeamScore) : null,
        match_status: isNaN(matchStatus) ? 1 : matchStatus,
        match_time: fm.MatchTime || '',
        played: played,
        updated_at: new Date().toISOString(),
      })
    }

    if (changes.length > 0) {
      const { error } = await supabase.from('match_results').upsert(changes, { onConflict: 'match_id' })
      if (error) {
        console.error('Erro ao salvar no Supabase:', error.message)
      }
    }
  } catch (err) {
    console.error('Erro no sync:', err.message)
  }
}

async function syncGoals() {
  try {
    const { data: existing } = await supabase
      .from('match_results')
      .select('match_id, match_status, goals')
      .in('match_status', [0, 3])

    if (!existing || existing.length === 0) return

    const matchesPath = join(__dirname, '..', 'src', 'data', 'matches.js')
    const matchesContent = readFileSync(matchesPath, 'utf8')
    const matchExport = matchesContent.match(/\[[\s\S]*\]/)?.[0]
    if (!matchExport) return
    const ourMatches = eval(`(${matchExport})`)

    const calendar = await fetchFifaData()
    let updated = 0

    for (const row of existing) {
      if (row.goals && row.goals.length > 2 && row.goals.includes('"player":"')) continue

      const ourMatch = ourMatches.find(m => Number(m.id) === Number(row.match_id))
      if (!ourMatch) continue

      const fromCode = Object.entries(FIFA_TO_OURS).find(([, v]) => v === ourMatch.homeTeam)?.[0]
      const toCode = Object.entries(FIFA_TO_OURS).find(([, v]) => v === ourMatch.awayTeam)?.[0]
      if (!fromCode || !toCode) continue

      const dateStr = ourMatch.date
      const fm = calendar.Results.find(r => {
        const ds = parseLocalDate(r.Date)
        return r.Home?.Abbreviation === fromCode && r.Away?.Abbreviation === toCode && ds === dateStr
      })
      if (!fm || !fm.IdMatch) continue

      const goals = await fetchMatchGoals(fm.IdMatch)
      if (goals !== null && goals !== row.goals) {
        await supabase.from('match_results').update({ goals }).eq('match_id', row.match_id)
        updated++
      }
    }

    if (updated > 0) {
      console.log(`[${new Date().toLocaleTimeString('pt-BR')}] Sync Goals: ${updated} partidas`)
    }
  } catch (err) {
    console.error('Erro no syncGoals:', err.message)
  }
}

refreshSync()
setInterval(refreshSync, 2000)

setTimeout(syncGoals, 5000)
setInterval(syncGoals, 30000)
