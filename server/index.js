import express from 'express';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dns from 'dns';
import { promisify } from 'util';
const resolveMx = promisify(dns.resolveMx);
const resolveNs = promisify(dns.resolveNs);

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const USERS_FILE = join(DATA_DIR, 'users.json');
const PREDICTIONS_FILE = join(DATA_DIR, 'predictions.json');
const RESULTS_FILE = join(DATA_DIR, 'results.json');

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
  'dropmail.me', 'emailnator.com', 'moakt.com',
]);

function hashPassword(pw) {
  return crypto.createHash('sha256').update(pw + 'copa2026salt').digest('hex');
}

function readJSON(path) {
  try {
    if (existsSync(path)) return JSON.parse(readFileSync(path, 'utf8'));
  } catch {}
  return {};
}

function writeJSON(path, data) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2));
}

const app = express();
app.use(express.json({ limit: '5mb' }));

app.use((req, res, next) => {
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
  try {
    const mx = await resolveMx(domain);
    if (mx && mx.length > 0) return res.json({ valid: true, error: null });
  } catch {}
  try {
    const ns = await resolveNs(domain);
    if (ns && ns.length > 0) return res.json({ valid: true, error: null });
  } catch {}
  return res.json({ valid: false, error: 'Domínio de email não encontrado' });
});

app.post('/api/register', (req, res) => {
  const { name, email, password, gender } = req.body || {};
  if (!name || !password || name.length < 3 || password.length < 3)
    return res.json({ success: false, error: 'Nome e senha devem ter no mínimo 3 caracteres' });
  const users = readJSON(USERS_FILE);
  if (users[name]) return res.json({ success: false, error: 'Nome de usuário já existe' });
  const isAdmin = Object.keys(users).length === 0;
  users[name] = {
    name, email: email || '', password: hashPassword(password),
    gender: gender || 'masculino', isAdmin, profilePhoto: '',
    createdAt: new Date().toISOString(),
  };
  writeJSON(USERS_FILE, users);
  const safe = { ...users[name] };
  delete safe.password;
  res.json({ success: true, user: safe, isAdmin, predictions: {} });
});

app.post('/api/login', (req, res) => {
  const { name, password } = req.body || {};
  const users = readJSON(USERS_FILE);
  const user = users[name];
  if (!user || user.password !== hashPassword(password))
    return res.json({ success: false, error: 'Nome ou senha inválidos' });
  const predictions = readJSON(PREDICTIONS_FILE)[name] || {};
  const safe = { ...user };
  delete safe.password;
  res.json({ success: true, user: safe, isAdmin: user.isAdmin, predictions });
});

app.post('/api/save-predictions', (req, res) => {
  const { name, predictions } = req.body || {};
  if (!name) return res.json({ success: false, error: 'Nome é obrigatório' });
  const allPredictions = readJSON(PREDICTIONS_FILE);
  allPredictions[name] = predictions || {};
  writeJSON(PREDICTIONS_FILE, allPredictions);
  res.json({ success: true });
});

app.get('/api/data', (req, res) => {
  const allUsers = readJSON(USERS_FILE);
  const safeUsers = {};
  for (const [k, v] of Object.entries(allUsers)) {
    safeUsers[k] = { name: v.name, email: v.email, gender: v.gender, isAdmin: v.isAdmin, profilePhoto: v.profilePhoto };
  }
  res.json({
    users: safeUsers,
    predictions: readJSON(PREDICTIONS_FILE),
    results: readJSON(RESULTS_FILE),
  });
});

app.post('/api/set-admin', (req, res) => {
  const { adminName, targetName, isAdmin } = req.body || {};
  const users = readJSON(USERS_FILE);
  if (!users[adminName]?.isAdmin) return res.json({ success: false, error: 'Não autorizado' });
  if (!users[targetName]) return res.json({ success: false, error: 'Usuário não encontrado' });
  users[targetName].isAdmin = !!isAdmin;
  writeJSON(USERS_FILE, users);
  res.json({ success: true });
});

app.post('/api/remove-user', (req, res) => {
  const { adminName, targetName } = req.body || {};
  const users = readJSON(USERS_FILE);
  if (!users[adminName]?.isAdmin) return res.json({ success: false, error: 'Não autorizado' });
  if (adminName === targetName) return res.json({ success: false, error: 'Não pode remover a si mesmo' });
  delete users[targetName];
  writeJSON(USERS_FILE, users);
  const allPredictions = readJSON(PREDICTIONS_FILE);
  delete allPredictions[targetName];
  writeJSON(PREDICTIONS_FILE, allPredictions);
  res.json({ success: true });
});

app.post('/api/clear-all', (req, res) => {
  const { adminName } = req.body || {};
  const users = readJSON(USERS_FILE);
  if (!users[adminName]?.isAdmin) return res.json({ success: false, error: 'Não autorizado' });
  writeJSON(USERS_FILE, {});
  writeJSON(PREDICTIONS_FILE, {});
  writeJSON(RESULTS_FILE, {});
  res.json({ success: true });
});

app.post('/api/update-profile', (req, res) => {
  const { name, email, gender, profilePhoto } = req.body || {};
  if (!name) return res.json({ success: false, error: 'Nome é obrigatório' });
  const users = readJSON(USERS_FILE);
  if (!users[name]) return res.json({ success: false, error: 'Usuário não encontrado' });
  if (email !== undefined) users[name].email = email;
  if (gender !== undefined) users[name].gender = gender;
  if (profilePhoto !== undefined) users[name].profilePhoto = profilePhoto;
  writeJSON(USERS_FILE, users);
  const safe = { ...users[name] };
  delete safe.password;
  res.json({ success: true, user: safe });
});

app.get('/api/sync', (req, res) => {
  res.json({ success: true, results: readJSON(RESULTS_FILE), lastSync: new Date().toISOString() });
});

app.get('/api/sync/status', (req, res) => {
  res.json({ running: true, lastSync: null, error: null });
});

app.post('/api/save-results', (req, res) => {
  const { adminName, results } = req.body || {};
  const users = readJSON(USERS_FILE);
  if (!users[adminName]?.isAdmin) return res.json({ success: false, error: 'Não autorizado' });
  writeJSON(RESULTS_FILE, results || {});
  res.json({ success: true });
});

function parseLocalDate(str) {
  const parts = str.slice(0, 10).split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
  const d = new Date(str);
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

async function fetchFifaData() {
  const res = await fetch(FIFA_API);
  if (!res.ok) throw new Error(`FIFA API returned ${res.status}`);
  return res.json();
}

async function refreshSync() {
  try {
    const { default: ourMatches } = await import('../src/data/matches.js');
    const data = await fetchFifaData();
    const currentResults = readJSON(RESULTS_FILE);
    let changed = false;
    for (const fm of data.Results) {
      const homeCode = fm.Home?.Abbreviation;
      const awayCode = fm.Away?.Abbreviation;
      const ourHome = FIFA_TO_OURS[homeCode];
      const ourAway = FIFA_TO_OURS[awayCode];
      if (!ourHome || !ourAway) continue;
      const dateStr = parseLocalDate(fm.LocalDate || fm.Date);
      const match = ourMatches.find(m => m.homeTeam === ourHome && m.awayTeam === ourAway && m.date === dateStr);
      if (!match) continue;
      if (fm.HomeTeamScore === null || fm.AwayTeamScore === null) continue;
      const id = match.id;
      const score = { homeScore: Number(fm.HomeTeamScore), awayScore: Number(fm.AwayTeamScore), played: true };
      if (!currentResults[id] || currentResults[id].homeScore !== score.homeScore || currentResults[id].awayScore !== score.awayScore) {
        currentResults[id] = score;
        changed = true;
      }
    }
    if (changed) {
      writeJSON(RESULTS_FILE, currentResults);
    }
  } catch {}
}

setInterval(refreshSync, 60000);
refreshSync();

const distPath = join(__dirname, '..', 'dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'API not found' });
    res.sendFile(join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
