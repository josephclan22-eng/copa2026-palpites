import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import { promisify } from 'util';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolveMx = promisify(dns.resolveMx);
const resolveNs = promisify(dns.resolveNs);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'dist')));

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'temp-mail.org',
  '10minutemail.com', 'throwaway.email', 'yopmail.com', 'trashmail.com',
  'sharklasers.com', 'grr.la', 'mail.tm', 'tempmail.net', 'mohmal.com',
  'mailnator.com', 'getnada.com', 'emailfake.com', 'emailsilo.com',
  'mailexpire.com', 'spamgourmet.com', 'dispostable.com', 'maildrop.cc',
  'mytemp.email', 'tempemail.net', 'spambox.us', 'maileater.com',
  'sneakemail.com', 'mailmetrash.com', 'anonymmail.com', 'mailcatch.com',
  'guerrillamail.org', 'guerrillamail.net', 'guerrillamail.biz',
  'tempemail.co', 'tmpmail.com', 'tmpmail.org', 'emailondeck.com',
  'fakemail.net', 'fakemailgenerator.com', 'mail-temp.com',
  'tempr.email', 'temp-mail.ru', 'temp-inbox.com', 'inboxkitten.com',
  'dropmail.me', 'emailnator.com', 'moakt.com', 'thankyou2010.com',
  'trash2009.com', 'mt2009.com', 'trashymail.com', 'tyldd.com',
  'objavam.com', 'ephemail.net', 'spam.la', 'mailmetrash.com',
  'temporarymail.com', 'tmail.com', 'mail-tester.com',
  'fakeinbox.com', 'mytrashmail.com', 'trashmail.ws',
  'wegwerfmail.de', 'wegwerfmail.net', 'wegwerfmail.org',
  'nurfuerspam.de', 'spamspam.com', 'spamfree24.org',
  'spamfree24.info', 'spamfree24.net',
]);

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

const STAGE_MAP = {
  'First Stage': 'group',
  'Round of 16': 'round16',
  'Quarter-finals': 'quarter',
  'Semi-finals': 'semi',
  'Match for third place': 'third',
  'Final': 'final',
};

let cache = { results: {}, lastFetch: null };
let syncStatus = { syncing: false, lastSync: null, error: null };

function parseLocalDate(localDateStr) {
  const parts = localDateStr.slice(0, 10).split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}`;
  }
  const d = new Date(localDateStr);
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function mapFifaMatch(fifaMatch, ourMatches) {
  const homeCode = fifaMatch.Home?.Abbreviation;
  const awayCode = fifaMatch.Away?.Abbreviation;
  const ourHome = FIFA_TO_OURS[homeCode];
  const ourAway = FIFA_TO_OURS[awayCode];
  if (!ourHome || !ourAway) return null;

  const localDate = fifaMatch.LocalDate || fifaMatch.Date;
  const dateStr = parseLocalDate(localDate);

  const ourMatch = ourMatches.find(m =>
    m.homeTeam === ourHome && m.awayTeam === ourAway &&
    m.date === dateStr
  );

  if (!ourMatch) return null;

  const played = fifaMatch.HomeTeamScore !== null && fifaMatch.AwayTeamScore !== null;

  if (!played) return null;

  return {
    matchId: ourMatch.id,
    homeScore: Number(fifaMatch.HomeTeamScore),
    awayScore: Number(fifaMatch.AwayTeamScore),
    played: true,
    homeTeam: ourHome,
    awayTeam: ourAway,
    date: dateStr,
  };
}

app.post('/api/validate-email', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({ valid: false, error: 'Email é obrigatório' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.json({ valid: false, error: 'Formato de email inválido' });
  }

  const domain = email.split('@')[1].toLowerCase();

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return res.json({ valid: false, error: 'Email descartável não permitido. Use um email real.' });
  }

  try {
    const mxRecords = await resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return res.json({ valid: false, error: 'Domínio de email não existe ou não aceita emails' });
    }
    return res.json({ valid: true, error: null });
  } catch {
    try {
      const nsRecords = await resolveNs(domain);
      if (!nsRecords || nsRecords.length === 0) {
        return res.json({ valid: false, error: 'Domínio de email não encontrado' });
      }
      return res.json({ valid: true, error: null });
    } catch {
      return res.json({ valid: false, error: 'Domínio de email não encontrado. Verifique o endereço.' });
    }
  }
});

app.get('/api/sync', async (req, res) => {
  try {
    syncStatus.syncing = true;

    const fifaRes = await fetch(FIFA_API);
    if (!fifaRes.ok) throw new Error(`FIFA API returned ${fifaRes.status}`);
    const fifaData = await fifaRes.json();

    const { default: ourMatches } = await import('../src/data/matches.js');

    const results = {};
    let mappedCount = 0;

    for (const fifaMatch of fifaData.Results) {
      const mapped = mapFifaMatch(fifaMatch, ourMatches);
      if (mapped) {
        results[mapped.matchId] = {
          homeScore: mapped.homeScore,
          awayScore: mapped.awayScore,
          played: true,
        };
        mappedCount++;
      }
    }

    cache = { results, lastFetch: new Date().toISOString() };
    syncStatus = { syncing: false, lastSync: new Date().toISOString(), error: null };

    res.json({
      success: true,
      results,
      totalMapped: mappedCount,
      lastSync: syncStatus.lastSync,
    });
  } catch (err) {
    syncStatus = { syncing: false, lastSync: cache.lastFetch, error: err.message };
    res.status(500).json({
      success: false,
      error: err.message,
      results: cache.results,
    });
  }
});

app.get('/api/sync/status', (req, res) => {
  res.json(syncStatus);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Sync server running on http://localhost:${PORT}`);
});
