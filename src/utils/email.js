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
  'temporarymail.com', 'tmail.com', 'tmailinator.com',
  'mail-tester.com', 'fakeinbox.com', 'mytrashmail.com',
  'trashmail.ws', 'wegwerfmail.de', 'wegwerfmail.net',
  'wegwerfmail.org', 'nurfuerspam.de', 'spamspam.com',
  'spamfree24.org', 'spamfree24.info', 'spamfree24.net',
]);

export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email é obrigatório' };
  }

  const trimmed = email.trim().toLowerCase();

  if (!trimmed) {
    return { valid: false, error: 'Email é obrigatório' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Formato de email inválido' };
  }

  const parts = trimmed.split('@');
  const localPart = parts[0];
  const domain = parts[1];

  if (localPart.length > 64) {
    return { valid: false, error: 'Email muito longo' };
  }

  if (domain.length > 255) {
    return { valid: false, error: 'Domínio do email muito longo' };
  }

  const domainParts = domain.split('.');
  if (domainParts.length < 2) {
    return { valid: false, error: 'Domínio inválido' };
  }

  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) {
    return { valid: false, error: 'Domínio inválido' };
  }

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, error: 'Email descartável não permitido. Use um email real.' };
  }

  return { valid: true, error: null };
}

export async function validateEmailDomain(email) {
  const result = validateEmail(email);
  if (!result.valid) return result;

  try {
    const res = await fetch('/api/validate-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
    const data = await res.json();
    return data;
  } catch {
    return { valid: true, error: null };
  }
}
