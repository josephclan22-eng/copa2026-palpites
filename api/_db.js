import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';

export const DATA_DIR = '/tmp/data';
const USERS_FILE = join(DATA_DIR, 'users.json');
const PREDICTIONS_FILE = join(DATA_DIR, 'predictions.json');
const RESULTS_FILE = join(DATA_DIR, 'results.json');

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function upstashGet(key) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null;
  try {
    const r = await fetch(`${UPSTASH_URL}/get/${key}`, { headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` } });
    const d = await r.json();
    return d?.result ? JSON.parse(d.result) : null;
  } catch { return null; }
}

async function upstashSet(key, val) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return;
  try { await fetch(`${UPSTASH_URL}/set/${key}`, { method: 'POST', headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify(JSON.stringify(val)) }); } catch {}
}

function localGet(path) {
  try { if (existsSync(path)) return JSON.parse(readFileSync(path, 'utf8')); } catch {}
  return null;
}

function localSet(path, data) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(path, JSON.stringify(data));
}

export async function dbGet(key) {
  const filePath = join(DATA_DIR, `${key}.json`);
  const cached = localGet(filePath);
  if (cached) return cached;
  const remote = await upstashGet(key);
  if (remote) { localSet(filePath, remote); return remote; }
  return {};
}

export async function dbSet(key, data) {
  const filePath = join(DATA_DIR, `${key}.json`);
  localSet(filePath, data);
  await upstashSet(key, data);
}

export function hashPassword(pw) {
  return crypto.createHash('sha256').update(pw + 'copa2026salt').digest('hex');
}

export function ok(res, data) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end(JSON.stringify(data));
}

export function fail(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end(JSON.stringify(data));
}

export function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve({}); } });
  });
}
