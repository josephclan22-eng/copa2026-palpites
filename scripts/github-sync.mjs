import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY
if (!supabaseUrl || !supabaseKey) {
  console.error('VITE_SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórios')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

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

async function fetchMatchGoals(idMatch) {
  try {
    const res = await fetch(`https://api.fifa.com/api/v3/live/football/${idMatch}`)
    if (!res.ok) return null
    const data = await res.json()
    const getNames = (players) => {
      const map = {}
      if (players) for (const p of players) {
        const name = p.PlayerName?.[0]?.Description || p.ShortName?.[0]?.Description || ''
        map[p.IdPlayer] = name
      }
      return map
    }
    const homePlayers = getNames(data.HomeTeam?.Players)
    const awayPlayers = getNames(data.AwayTeam?.Players)
    const parseGoals = (goals, playerMap) => (goals || []).map(g => ({
      player: playerMap[g.IdPlayer] || `Player ${g.IdPlayer}`,
      minute: g.Minute?.replace("'", '') || '',
    }))
    return {
      homeGoals: parseGoals(data.HomeTeam?.Goals, homePlayers),
      awayGoals: parseGoals(data.AwayTeam?.Goals, awayPlayers),
    }
  } catch { return null }
}

async function run() {
  const matchesPath = join(__dirname, '..', 'src', 'data', 'matches.js')
  const content = readFileSync(matchesPath, 'utf8')
  const arr = content.match(/\[[\s\S]*\]/)?.[0]
  if (!arr) { console.error('Could not parse matches'); process.exit(1) }
  const ourMatches = eval(`(${arr})`)

  const res = await fetch(FIFA_API)
  if (!res.ok) { console.error(`FIFA API returned ${res.status}`); process.exit(1) }
  const data = await res.json()
  const changes = []

  for (const fm of data.Results) {
    const homeCode = fm.Home?.Abbreviation
    const awayCode = fm.Away?.Abbreviation
    const ourHome = FIFA_TO_OURS[homeCode]
    const ourAway = FIFA_TO_OURS[awayCode]
    if (!ourHome || !ourAway) { console.log(`  Skip ${homeCode} vs ${awayCode}: equipe nao mapeada`); continue }
    const dateStr = parseLocalDate(fm.LocalDate || fm.Date)
    const match = ourMatches.find(m => m.homeTeam === ourHome && m.awayTeam === ourAway && m.date === dateStr)
    if (!match) { console.log(`  Skip ${ourHome} vs ${ourAway} (${dateStr}): jogo nao encontrado no matches.js`); continue }
    const hasScore = fm.HomeTeamScore !== null && fm.AwayTeamScore !== null
    const isLive = fm.MatchStatus === 3 || (fm.MatchTime && !hasScore)
    if (!hasScore && !isLive) { console.log(`  Skip M${match.id} ${ourHome} vs ${ourAway}: sem placar e nao ao vivo`); continue }

    const entry = {
      match_id: match.id,
      home_score: hasScore ? Number(fm.HomeTeamScore) : null,
      away_score: hasScore ? Number(fm.AwayTeamScore) : null,
      played: hasScore,
      match_time: fm.MatchTime || '',
      match_status: fm.MatchStatus,
      updated_at: new Date().toISOString(),
    }

    if (hasScore && fm.IdMatch) {
      const goals = await fetchMatchGoals(fm.IdMatch)
      if (goals) {
        entry.home_goals = goals.homeGoals
        entry.away_goals = goals.awayGoals
      }
    }

    changes.push(entry)
    const goalInfo = entry.home_goals ? ` (${entry.home_goals.length + entry.away_goals.length} gols)` : ''
    console.log(`  Match M${match.id}: ${ourHome} ${hasScore ? fm.HomeTeamScore+'-'+fm.AwayTeamScore : 'ao vivo'} ${ourAway} -> salvo!${goalInfo}`)
  }

  if (changes.length > 0) {
    const { error } = await supabase.from('match_results').upsert(changes, { onConflict: 'match_id' })
    if (error) { console.error('Erro Supabase:', error.message); process.exit(1) }
    console.log(`Sync: ${changes.length} resultados atualizados`)
  } else {
    console.log('Sync: nenhum resultado novo')
  }
}

run().catch(err => { console.error(err.message); process.exit(1) })
