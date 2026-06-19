// scripts/sync-fifa.js — Sync FIFA API → Supabase (com gols)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const FT = {MEX:'MEXICO',RSA:'AFRICA_SUL',KOR:'COREIA_SUL',CZE:'REP_TCHECA',CAN:'CANADA',BIH:'BOSNIA',QAT:'CATAR',SUI:'SUICA',BRA:'BRASIL',MAR:'MARROCOS',HAI:'HAITI',SCO:'ESCOCIA',USA:'USA',PAR:'PARAGUAI',AUS:'AUSTRALIA',TUR:'TURQUIA',GER:'ALEMANHA',CUW:'CURACAO',CIV:'COSTA_MARFIM',ECU:'EQUADOR',NED:'HOLANDA',JPN:'JAPAO',SWE:'SUECIA',TUN:'TUNISIA',BEL:'BELGICA',EGY:'EGITO',IRN:'IRA',NZL:'NOVA_ZELANDIA',ESP:'ESPANHA',CPV:'CABO_VERDE',KSA:'ARABIA',URU:'URUGUAI',FRA:'FRANCA',SEN:'SENEGAL',IRQ:'IRAQUE',NOR:'NORUEGA',ARG:'ARGENTINA',ALG:'ARGELIA',AUT:'AUSTRIA',JOR:'JORDANIA',POR:'PORTUGAL',COD:'RD_CONGO',UZB:'UZBEQUISTAO',COL:'COLOMBIA',ENG:'INGLATERRA',CRO:'CROACIA',GHA:'GANA',PAN:'PANAMA'};
const MX = [{id:1,date:'11/06/2026',home:'MEXICO',away:'AFRICA_SUL'},{id:2,date:'11/06/2026',home:'COREIA_SUL',away:'REP_TCHECA'},{id:3,date:'12/06/2026',home:'CANADA',away:'BOSNIA'},{id:4,date:'12/06/2026',home:'USA',away:'PARAGUAI'},{id:5,date:'13/06/2026',home:'CATAR',away:'SUICA'},{id:6,date:'13/06/2026',home:'BRASIL',away:'MARROCOS'},{id:7,date:'13/06/2026',home:'HAITI',away:'ESCOCIA'},{id:8,date:'14/06/2026',home:'AUSTRALIA',away:'TURQUIA'},{id:9,date:'14/06/2026',home:'ALEMANHA',away:'CURACAO'},{id:10,date:'14/06/2026',home:'HOLANDA',away:'JAPAO'},{id:11,date:'14/06/2026',home:'COSTA_MARFIM',away:'EQUADOR'},{id:12,date:'14/06/2026',home:'SUECIA',away:'TUNISIA'},{id:13,date:'15/06/2026',home:'ESPANHA',away:'CABO_VERDE'},{id:14,date:'15/06/2026',home:'BELGICA',away:'EGITO'},{id:15,date:'15/06/2026',home:'ARABIA',away:'URUGUAI'},{id:16,date:'15/06/2026',home:'IRA',away:'NOVA_ZELANDIA'},{id:17,date:'16/06/2026',home:'FRANCA',away:'SENEGAL'},{id:18,date:'16/06/2026',home:'IRAQUE',away:'NORUEGA'},{id:19,date:'16/06/2026',home:'ARGENTINA',away:'ARGELIA'},{id:20,date:'17/06/2026',home:'AUSTRIA',away:'JORDANIA'},{id:21,date:'17/06/2026',home:'PORTUGAL',away:'RD_CONGO'},{id:22,date:'17/06/2026',home:'INGLATERRA',away:'CROACIA'},{id:23,date:'17/06/2026',home:'GANA',away:'PANAMA'},{id:24,date:'17/06/2026',home:'UZBEQUISTAO',away:'COLOMBIA'},{id:25,date:'18/06/2026',home:'REP_TCHECA',away:'AFRICA_SUL'},{id:26,date:'18/06/2026',home:'SUICA',away:'BOSNIA'},{id:27,date:'18/06/2026',home:'CANADA',away:'CATAR'},{id:28,date:'18/06/2026',home:'MEXICO',away:'COREIA_SUL'},{id:29,date:'19/06/2026',home:'USA',away:'AUSTRALIA'},{id:30,date:'19/06/2026',home:'ESCOCIA',away:'MARROCOS'},{id:31,date:'19/06/2026',home:'BRASIL',away:'HAITI'},{id:32,date:'20/06/2026',home:'TURQUIA',away:'PARAGUAI'},{id:33,date:'20/06/2026',home:'HOLANDA',away:'SUECIA'},{id:34,date:'20/06/2026',home:'ALEMANHA',away:'COSTA_MARFIM'},{id:35,date:'20/06/2026',home:'EQUADOR',away:'CURACAO'},{id:36,date:'21/06/2026',home:'TUNISIA',away:'JAPAO'},{id:37,date:'21/06/2026',home:'ESPANHA',away:'ARABIA'},{id:38,date:'21/06/2026',home:'BELGICA',away:'IRA'},{id:39,date:'21/06/2026',home:'URUGUAI',away:'CABO_VERDE'},{id:40,date:'21/06/2026',home:'NOVA_ZELANDIA',away:'EGITO'},{id:41,date:'22/06/2026',home:'ARGENTINA',away:'AUSTRIA'},{id:42,date:'22/06/2026',home:'FRANCA',away:'IRAQUE'},{id:43,date:'22/06/2026',home:'NORUEGA',away:'SENEGAL'},{id:44,date:'23/06/2026',home:'JORDANIA',away:'ARGELIA'},{id:45,date:'23/06/2026',home:'PORTUGAL',away:'UZBEQUISTAO'},{id:46,date:'23/06/2026',home:'INGLATERRA',away:'GANA'},{id:47,date:'23/06/2026',home:'PANAMA',away:'CROACIA'},{id:48,date:'23/06/2026',home:'COLOMBIA',away:'RD_CONGO'},{id:49,date:'24/06/2026',home:'BOSNIA',away:'CATAR'},{id:50,date:'24/06/2026',home:'SUICA',away:'CANADA'},{id:51,date:'24/06/2026',home:'MARROCOS',away:'HAITI'},{id:52,date:'24/06/2026',home:'ESCOCIA',away:'BRASIL'},{id:53,date:'24/06/2026',home:'AFRICA_SUL',away:'COREIA_SUL'},{id:54,date:'24/06/2026',home:'REP_TCHECA',away:'MEXICO'},{id:55,date:'25/06/2026',home:'CURACAO',away:'COSTA_MARFIM'},{id:56,date:'25/06/2026',home:'EQUADOR',away:'ALEMANHA'},{id:57,date:'25/06/2026',home:'TUNISIA',away:'HOLANDA'},{id:58,date:'25/06/2026',home:'JAPAO',away:'SUECIA'},{id:59,date:'25/06/2026',home:'PARAGUAI',away:'AUSTRALIA'},{id:60,date:'25/06/2026',home:'TURQUIA',away:'USA'},{id:61,date:'26/06/2026',home:'SENEGAL',away:'IRAQUE'},{id:62,date:'26/06/2026',home:'NORUEGA',away:'FRANCA'},{id:63,date:'26/06/2026',home:'URUGUAI',away:'ESPANHA'},{id:64,date:'26/06/2026',home:'CABO_VERDE',away:'ARABIA'},{id:65,date:'27/06/2026',home:'NOVA_ZELANDIA',away:'BELGICA'},{id:66,date:'27/06/2026',home:'EGITO',away:'IRA'},{id:67,date:'27/06/2026',home:'PANAMA',away:'INGLATERRA'},{id:68,date:'27/06/2026',home:'CROACIA',away:'GANA'},{id:69,date:'27/06/2026',home:'RD_CONGO',away:'UZBEQUISTAO'},{id:70,date:'27/06/2026',home:'COLOMBIA',away:'PORTUGAL'},{id:71,date:'27/06/2026',home:'ARGELIA',away:'AUSTRIA'},{id:72,date:'27/06/2026',home:'JORDANIA',away:'ARGENTINA'}];

function pd(s) { const d = new Date(s); d.setHours(d.getHours()-3); return String(d.getUTCDate()).padStart(2,'0')+'/'+String(d.getUTCMonth()+1).padStart(2,'0')+'/'+d.getUTCFullYear(); }

async function httpGet(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'copa2026/1.0' } });
  if (!res.ok) return null;
  return res.json();
}

async function getGoals(idMatch) {
  const live = await httpGet('https://api.fifa.com/api/v3/live/football/' + idMatch);
  if (!live) return { home_goals: [], away_goals: [] };
  const pm = {};
  (live.HomeTeam?.Players || []).forEach(p => { const n = p.PlayerName?.[0]?.Description || p.ShortName?.[0]?.Description || ''; if (n) pm[p.IdPlayer] = n; });
  (live.AwayTeam?.Players || []).forEach(p => { const n = p.PlayerName?.[0]?.Description || p.ShortName?.[0]?.Description || ''; if (n) pm[p.IdPlayer] = n; });
  const hg = (live.HomeTeam?.Goals || []).map(g => ({ player: pm[g.IdPlayer] || '', minute: (g.Minute || '').replace(/'/g, '') }));
  const ag = (live.AwayTeam?.Goals || []).map(g => ({ player: pm[g.IdPlayer] || '', minute: (g.Minute || '').replace(/'/g, '') }));
  return { home_goals: hg, away_goals: ag };
}

(async () => {
  console.log('[sync] Buscando FIFA API...');
  const data = await httpGet('https://api.fifa.com/api/v3/calendar/matches?idCompetition=17&idSeason=285023&language=en&count=200');
  if (!data) { console.log('[sync] FIFA API indisponivel'); return; }
  console.log('[sync] ' + data.Results.length + ' partidas');

  let total = 0, comGols = 0;
  for (const fm of data.Results) {
    const hc = fm.Home?.Abbreviation, ac = fm.Away?.Abbreviation;
    if (!hc || !ac) continue;
    const oh = FT[hc], oa = FT[ac];
    if (!oh || !oa) continue;
    const m = MX.find(x => x.home === oh && x.away === oa && x.date === pd(fm.Date));
    if (!m) continue;
    const ms = Number(fm.MatchStatus);
    const hs = fm.HomeTeamScore !== null ? Number(fm.HomeTeamScore) : null;
    const as = fm.AwayTeamScore !== null ? Number(fm.AwayTeamScore) : null;
    const payload = {
      match_id: m.id, home_score: hs, away_score: as,
      match_status: isNaN(ms) ? 1 : ms,
      match_time: fm.MatchTime || '', played: ms === 0,
      updated_at: new Date().toISOString()
    };
    if ((ms === 0 || ms === 3) && fm.IdMatch) {
      const g = await getGoals(fm.IdMatch);
      payload.home_goals = g.home_goals;
      payload.away_goals = g.away_goals;
      if (g.home_goals.length || g.away_goals.length) comGols++;
    }
    const res = await fetch(SUPABASE_URL + '/rest/v1/match_results?match_id=eq.' + m.id, {
      method: 'PATCH',
      headers: { 'apikey': SERVICE_KEY, 'Authorization': 'Bearer ' + SERVICE_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
      body: JSON.stringify(payload),
    });
    if (res.ok) total++;
  }
  console.log('[sync] ' + total + ' partidas, ' + comGols + ' com gols');
})();
