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

async function fetchMatchDetails(idMatch) {
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
      type: g.Type,
    }))
    const parseCards = (bookings, playerMap) => (bookings || []).map(b => ({
      player: playerMap[b.IdPlayer] || '',
      minute: b.Minute?.replace("'", '') || '',
      card: b.Card,
      teamId: b.IdTeam,
    }))
    return {
      homeGoals: parseGoals(data.HomeTeam?.Goals, homePlayers),
      awayGoals: parseGoals(data.AwayTeam?.Goals, awayPlayers),
      homeCards: parseCards(data.HomeTeam?.Bookings, homePlayers),
      awayCards: parseCards(data.AwayTeam?.Bookings, awayPlayers),
      matchTime: data.MatchTime || '',
      matchStatus: data.MatchStatus,
      period: data.Period,
      homeTeamId: data.HomeTeam?.IdTeam,
      awayTeamId: data.AwayTeam?.IdTeam,
    }
  } catch { return null }
}

async function reportMatchEvents(match, details, fifaMatch) {
  const teamsModule = await import('../src/data/teams.js')
  const teams = teamsModule.default
  const homeTeam = teams[match.homeTeam]
  const awayTeam = teams[match.awayTeam]
  const homeName = homeTeam?.name || match.homeTeam
  const awayName = awayTeam?.name || match.awayTeam
  const key = `events_M${match.id}`

  const { data: existing } = await supabase.from('chat_messages').select('message').ilike('message', `${key}%`).limit(1).maybeSingle()
  let reported = existing ? parseInt(existing.message.match(/reported=(\d+)/)?.[1] || '0') : 0

  const homeG = details.homeGoals || []
  const awayG = details.awayGoals || []
  const homeC = details.homeCards || []
  const awayC = details.awayCards || []
  const totalEvents = homeG.length + awayG.length + homeC.length + awayC.length

  if (totalEvents === reported) return

  if (totalEvents > reported) {
    let msg = ''
    const newEvents = totalEvents - reported
    if (newEvents === 1 && totalEvents === 1) {
      if (homeG.length > 0 && reported < 1) {
        const g = homeG[0]
        msg = `⚽ GOL! ${homeName} ${g.minute}' — ${g.player}`
      } else if (awayG.length > 0) {
        const g = awayG[0]
        msg = `⚽ GOL! ${awayName} ${g.minute}' — ${g.player}`
      }
    } else {
      const allNew = []
      for (let i = reported; i < homeG.length; i++) allNew.push(`⚽ ${homeName} — ${homeG[i].player} ${homeG[i].minute}'`)
      for (let i = reported; i < awayG.length; i++) allNew.push(`⚽ ${awayName} — ${awayG[i].player} ${awayG[i].minute}'`)
      for (let i = reported; i < homeC.length; i++) {
        const c = homeC[i]
        allNew.push(`${c.card === 2 ? '🟥' : '🟨'} ${homeName} — ${c.player || 'Jogador'} ${c.minute}'${c.card === 2 ? ' (EXPULSO)' : ''}`)
      }
      for (let i = reported; i < awayC.length; i++) {
        const c = awayC[i]
        allNew.push(`${c.card === 2 ? '🟥' : '🟨'} ${awayName} — ${c.player || 'Jogador'} ${c.minute}'${c.card === 2 ? ' (EXPULSO)' : ''}`)
      }
      msg = allNew.slice(0, 3).join('\n')
    }

    if (msg) {
      const status = details.matchStatus === 0 ? '🏁 Fim de jogo' : details.period === 3 ? `1ºT ${details.matchTime}` : details.period === 5 ? `2ºT ${details.matchTime}` : `⏱ ${details.matchTime}`
      const full = `${homeName} ${fifaMatch.HomeTeamScore ?? '?'} x ${fifaMatch.AwayTeamScore ?? '?'} ${awayName}\n${status}\n${msg}\n[${key} reported=${totalEvents}]`
      await sendReminder(full)
      console.log(`  Reporter M${match.id}: ${newEvents} novo(s) evento(s)`)
    }
  }
}

function getTodayStr() {
  const now = new Date()
  return `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}`
}

function getMatchTimestamp(match) {
  const [day, month] = match.date.split('/')
  const [hour, minute] = match.time.split(':')
  return new Date(2026, parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute)).getTime()
}

let botUserId = null

async function getBotUserId() {
  if (botUserId) return botUserId
  const { data } = await supabase.from('profiles').select('id').limit(1)
  if (data && data[0]) botUserId = data[0].id
  return botUserId
}

async function sendReminder(msg) {
  const uid = await getBotUserId()
  if (!uid) { console.error('Nenhum usuario encontrado para enviar lembrete'); return }
  const { error } = await supabase.from('chat_messages').insert({
    user_id: uid,
    user_name: '🤖 Bot da Copa',
    message: msg,
    created_at: new Date().toISOString(),
  })
  if (error) console.error('Erro ao enviar lembrete:', error.message)
}

async function sendMatchReminders(ourMatches) {
  const today = getTodayStr()
  const now = Date.now()
  const teamsModule = await import('../src/data/teams.js')
  const teams = teamsModule.default

  const todayMatches = ourMatches.filter(m => m.date === today && m.stage === 'group')
  if (todayMatches.length === 0) return

  for (const match of todayMatches) {
    const diff = getMatchTimestamp(match) - now
    const minsUntil = Math.floor(diff / 60000)

    if (minsUntil > 25 && minsUntil < 35) {
      const home = teams[match.homeTeam]
      const away = teams[match.awayTeam]
      const homeName = home?.name || match.homeTeam
      const awayName = away?.name || match.awayTeam
      const key = `reminder_30min_M${match.id}`
      const { data: existing } = await supabase.from('chat_messages').select('id').ilike('message', `${key}%`).limit(1).maybeSingle()
      if (!existing) {
        await sendReminder(`🔔 LEMBRETE | ${homeName} 🆚 ${awayName}\n⚽ FALTAM 30 MINUTOS!\n⏰ ${match.time} | ${match.venue}\n📝 Corre fazer teu palpite! [${key}]`)
        console.log(`  Lembrete 30min: M${match.id} ${homeName} vs ${awayName}`)
      }
    }
  }

  const key = `daily_reminder_${today}`
  const { data: existing } = await supabase.from('chat_messages').select('id').ilike('message', `${key}%`).limit(1).maybeSingle()
  if (!existing && todayMatches.length > 0) {
    let msg = `📅 RODADA DE HOJE (${today}):\n`
    for (const match of todayMatches) {
      const home = teams[match.homeTeam]
      const away = teams[match.awayTeam]
      const homeName = home?.name || match.homeTeam
      const awayName = away?.name || match.awayTeam
      const diff = getMatchTimestamp(match) - now
      const status = diff < 0 ? '🔴 AO VIVO' : diff < 3600000 ? `⏰ Em ${Math.floor(diff/60000)}min` : `🕐 ${match.time}`
      msg += `\n${status} — ${homeName} x ${awayName}`
    }
    msg += '\n\n🎯 Faça seus palpites!'
    msg += ` [${key}]`
    await sendReminder(msg)
    console.log(`  Lembrete diario: ${todayMatches.length} jogos hoje`)
  }
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
    if (!hasScore) { console.log(`  Skip M${match.id} ${ourHome} vs ${ourAway}: sem placar`); continue }

    const entry = {
      match_id: match.id,
      home_score: Number(fm.HomeTeamScore),
      away_score: Number(fm.AwayTeamScore),
      played: true,
      match_time: fm.MatchTime || '',
      match_status: fm.MatchStatus,
      updated_at: new Date().toISOString(),
    }

    if (fm.IdMatch && hasScore) {
      const details = await fetchMatchDetails(fm.IdMatch)
      if (details) {
        entry.home_goals = details.homeGoals
        entry.away_goals = details.awayGoals
        await reportMatchEvents(match, details, fm)
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

  await sendMatchReminders(ourMatches)
}

run().catch(err => { console.error(err.message); process.exit(1) })
