import { ok, fail } from './_db.js';
import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);
const resolveNs = promisify(dns.resolveNs);

const DISPOSABLE = new Set([
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

export default async (req, res) => {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  let body = '';
  await new Promise(r => { req.on('data', c => body += c); req.on('end', r); });
  const { email } = (() => { try { return JSON.parse(body); } catch { return {}; } })();
  if (!email) return fail(res, 400, { valid: false, error: 'Email é obrigatório' });
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return fail(res, 400, { valid: false, error: 'Email inválido' });
  if (DISPOSABLE.has(domain)) return fail(res, 400, { valid: false, error: 'Email descartável não permitido' });
  try { const mx = await resolveMx(domain); if (mx?.length > 0) return ok(res, { valid: true }); } catch {}
  try { const ns = await resolveNs(domain); if (ns?.length > 0) return ok(res, { valid: true }); } catch {}
  ok(res, { valid: false, error: 'Domínio de email não encontrado' });
};
