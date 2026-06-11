const SYNC_URL = '/api/sync';
const STATUS_URL = '/api/sync/status';

async function safeJson(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function syncResults() {
  try {
    const res = await fetch(SYNC_URL);
    const data = await safeJson(res);
    if (!data || !data.success) return { success: false, matches: [] };
    return data;
  } catch {
    return { success: false, matches: [] };
  }
}

export async function getSyncStatus() {
  try {
    const res = await fetch(STATUS_URL);
    return await safeJson(res) || { running: false };
  } catch {
    return { running: false };
  }
}
