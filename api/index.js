import express from 'express';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';
import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);
const resolveNs = promisify(dns.resolveNs);

const DATA_DIR = '/tmp/data';
const USERS_FILE = join(DATA_DIR, 'users.json');
const PREDICTIONS_FILE = join(DATA_DIR, 'predictions.json');
const RESULTS_FILE = join(DATA_DIR, 'results.json');

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function upstashGet(key) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null;
  try {
    const res = await fetch(`${UPSTASH_URL}/get/${key}`, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
    });
    const data = await res.json();
    return data?.result ? JSON.parse(data.result) : null;
  } catch { return null; }
}

async function upstashSet(key, value) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return;
  try {
    await fetch(`${UPSTASH_URL}/set/${key}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(JSON.stringify(value)),
    });
  } catch {}
}

async function readStorage(filePath, upstashKey) {
  if (existsSync(filePath)) {
    try { return JSON.parse(readFileSync(filePath, 'utf8')); } catch {}
  }
  if (upstashKey) {
    const data = await upstashGet(upstashKey);
    if (data) {
      mkdirSync(DATA_DIR, { recursive: true });
      writeFileSync(filePath, JSON.stringify(data));
      return data;
    }
  }
  return {};
}

function writeLocal(filePath, data) {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(filePath, JSON.stringify(data));
}

async function persist(key, data, filePath) {
  writeLocal(filePath, data);
  await upstashSet(key, data);
}

const FIFA_API = 'https://api.fifa.com/api/v3/calendar/matches?idCompetition=17&idSeason=285023&language=en&count=200';

const FIFA_TO_OURS = {
  MEX:'MEXICO',RSA:'AFRICA_SUL',KOR:'COREIA_SUL',CZE:'REP_TCHECA',
  CAN:'CANADA',BIH:'BOSNIA',QAT:'CATAR',SUI:'SUICA',
  BRA:'BRASIL',MAR:'MARROCOS',HAI:'HAITI',SCO:'ESCOCIA',
  USA:'USA',PAR:'PARAGUAI',AUS:'AUSTRALIA',TUR:'TURQUIA',
  GER:'ALEMANHA',CUW:'CURACAO',CIV:'COSTA_MARFIM',ECU:'EQUADOR',
  NED:'HOLANDA',JPN:'JAPAO',SWE:'SUECIA',TUN:'TUNISIA',
  BEL:'BELGICA',EGY:'EGITO',IRN:'IRA',NZL:'NOVA_ZELANDIA',
  ESP:'ESPANHA',CPV:'CABO_VERDE',KSA:'ARABIA',URU:'URUGUAI',
  FRA:'FRANCA',SEN:'SENEGAL',IRQ:'IRAQUE',NOR:'NORUEGA',
  ARG:'ARGENTINA',ALG:'ARGELIA',AUT:'AUSTRIA',JOR:'JORDANIA',
  POR:'PORTUGAL',COD:'RD_CONGO',UZB:'UZBEQUISTAO',COL:'COLOMBIA',
  ENG:'INGLATERRA',CRO:'CROACIA',GHA:'GANA',PAN:'PANAMA',
};

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com','guerrillamail.com','tempmail.com','temp-mail.org',
  '10minutemail.com','throwaway.email','yopmail.com','trashmail.com',
  'sharklasers.com','grr.la','mail.tm','tempmail.net','mohmal.com',
  'mailnator.com','getnada.com','emailfake.com','emailsilo.com',
  'mailexpire.com','spamgourmet.com','dispostable.com','maildrop.cc',
  'mytemp.email','tempemail.net','spambox.us','maileater.com',
  'sneakemail.com','mailmetrash.com','anonymmail.com','mailcatch.com',
  'guerrillamail.org','guerrillamail.net','guerrillamail.biz',
  'tempemail.co','tmpmail.com','tmpmail.org','emailondeck.com',
  'fakemail.net','fakemailgenerator.com','mail-temp.com',
  'tempr.email','temp-mail.ru','temp-inbox.com','inboxkitten.com',
  'dropmail.me','emailnator.com','moakt.com',
]);

function hashPassword(pw) {
  return crypto.createHash('sha256').update(pw + 'copa2026salt').digest('hex');
}

function parseLocalDate(str) {
  const parts = str.slice(0, 10).split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
  const d = new Date(str);
  return `${String(d.getUTCDate()).padStart(2,'0')}/${String(d.getUTCMonth()+1).padStart(2,'0')}`;
}

const app = express();
app.use(express.json({ limit: '5mb' }));

app.all('*', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

app.post('/api/validate-email', async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.json({ valid: false, error: 'Email é obrigatório' });
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return res.json({ valid: false, error: 'Email inválido' });
  if (DISPOSABLE_DOMAINS.has(domain)) return res.json({ valid: false, error: 'Email descartável não permitido' });
  try { const mx = await resolveMx(domain); if (mx?.length > 0) return res.json({ valid: true }); } catch {}
  try { const ns = await resolveNs(domain); if (ns?.length > 0) return res.json({ valid: true }); } catch {}
  return res.json({ valid: false, error: 'Domínio de email não encontrado' });
});

app.post('/api/register', async (req, res) => {
  const { name, email, password, gender } = req.body || {};
  if (!name || !password || name.length < 3 || password.length < 3)
    return res.json({ success: false, error: 'Nome e senha devem ter no mínimo 3 caracteres' });
  const users = await readStorage(USERS_FILE, 'users');
  if (users[name]) return res.json({ success: false, error: 'Nome de usuário já existe' });
  const isAdmin = Object.keys(users).length === 0;
  users[name] = { name, email: email || '', password: hashPassword(password), gender: gender || 'masculino', isAdmin, profilePhoto: '', createdAt: new Date().toISOString() };
  await persist('users', users, USERS_FILE);
  const safe = { ...users[name] }; delete safe.password;
  res.json({ success: true, user: safe, isAdmin, predictions: {} });
});

app.post('/api/login', async (req, res) => {
  const { name, password } = req.body || {};
  const users = await readStorage(USERS_FILE, 'users');
  const user = users[name];
  if (!user || user.password !== hashPassword(password))
    return res.json({ success: false, error: 'Nome ou senha inválidos' });
  const predictions = (await readStorage(PREDICTIONS_FILE, 'predictions'))[name] || {};
  const safe = { ...user }; delete safe.password;
  res.json({ success: true, user: safe, isAdmin: user.isAdmin, predictions });
});

app.post('/api/save-predictions', async (req, res) => {
  const { name, predictions } = req.body || {};
  if (!name) return res.json({ success: false, error: 'Nome é obrigatório' });
  const all = await readStorage(PREDICTIONS_FILE, 'predictions');
  all[name] = predictions || {};
  await persist('predictions', all, PREDICTIONS_FILE);
  res.json({ success: true });
});

app.get('/api/data', async (req, res) => {
  const allUsers = await readStorage(USERS_FILE, 'users');
  const safeUsers = {};
  for (const [k, v] of Object.entries(allUsers))
    safeUsers[k] = { name: v.name, email: v.email, gender: v.gender, isAdmin: v.isAdmin, profilePhoto: v.profilePhoto };
  res.json({ users: safeUsers, predictions: await readStorage(PREDICTIONS_FILE, 'predictions'), results: await readStorage(RESULTS_FILE, 'results') });
});

app.post('/api/set-admin', async (req, res) => {
  const { adminName, targetName, isAdmin } = req.body || {};
  const users = await readStorage(USERS_FILE, 'users');
  if (!users[adminName]?.isAdmin) return res.json({ success: false, error: 'Não autorizado' });
  if (!users[targetName]) return res.json({ success: false, error: 'Usuário não encontrado' });
  users[targetName].isAdmin = !!isAdmin;
  await persist('users', users, USERS_FILE);
  res.json({ success: true });
});

app.post('/api/remove-user', async (req, res) => {
  const { adminName, targetName } = req.body || {};
  const users = await readStorage(USERS_FILE, 'users');
  if (!users[adminName]?.isAdmin) return res.json({ success: false, error: 'Não autorizado' });
  if (adminName === targetName) return res.json({ success: false, error: 'Não pode remover a si mesmo' });
  delete users[targetName];
  await persist('users', users, USERS_FILE);
  const all = await readStorage(PREDICTIONS_FILE, 'predictions');
  delete all[targetName];
  await persist('predictions', all, PREDICTIONS_FILE);
  res.json({ success: true });
});

app.post('/api/clear-all', async (req, res) => {
  const { adminName } = req.body || {};
  const users = await readStorage(USERS_FILE, 'users');
  if (!users[adminName]?.isAdmin) return res.json({ success: false, error: 'Não autorizado' });
  await persist('users', {}, USERS_FILE);
  await persist('predictions', {}, PREDICTIONS_FILE);
  await persist('results', {}, RESULTS_FILE);
  res.json({ success: true });
});

app.post('/api/update-profile', async (req, res) => {
  const { name, email, gender, profilePhoto } = req.body || {};
  if (!name) return res.json({ success: false, error: 'Nome é obrigatório' });
  const users = await readStorage(USERS_FILE, 'users');
  if (!users[name]) return res.json({ success: false, error: 'Usuário não encontrado' });
  if (email !== undefined) users[name].email = email;
  if (gender !== undefined) users[name].gender = gender;
  if (profilePhoto !== undefined) users[name].profilePhoto = profilePhoto;
  await persist('users', users, USERS_FILE);
  const safe = { ...users[name] }; delete safe.password;
  res.json({ success: true, user: safe });
});

app.post('/api/save-results', async (req, res) => {
  const { adminName, results } = req.body || {};
  const users = await readStorage(USERS_FILE, 'users');
  if (!users[adminName]?.isAdmin) return res.json({ success: false, error: 'Não autorizado' });
  await persist('results', results || {}, RESULTS_FILE);
  res.json({ success: true });
});

app.get('/api/sync', async (req, res) => {
  try {
    const { default: ourMatches } = await import('../src/data/matches.js');
    const fifaRes = await fetch(FIFA_API);
    const fifaData = await fifaRes.json();
    const currentResults = await readStorage(RESULTS_FILE, 'results');
    for (const fm of fifaData.Results) {
      const homeCode = fm.Home?.Abbreviation, awayCode = fm.Away?.Abbreviation;
      const ourHome = FIFA_TO_OURS[homeCode], ourAway = FIFA_TO_OURS[awayCode];
      if (!ourHome || !ourAway) continue;
      const dateStr = parseLocalDate(fm.LocalDate || fm.Date);
      const match = ourMatches.find(m => m.homeTeam === ourHome && m.awayTeam === ourAway && m.date === dateStr);
      if (!match) continue;
      if (fm.HomeTeamScore === null || fm.AwayTeamScore === null) continue;
      currentResults[match.id] = { homeScore: Number(fm.HomeTeamScore), awayScore: Number(fm.AwayTeamScore), played: true };
    }
    await persist('results', currentResults, RESULTS_FILE);
    res.json({ success: true, results: currentResults, lastSync: new Date().toISOString() });
  } catch {
    res.json({ success: true, results: await readStorage(RESULTS_FILE, 'results'), lastSync: null });
  }
});

app.get('/api/sync/status', (req, res) => {
  res.json({ running: true, lastSync: null, error: null });
});

export default app;
