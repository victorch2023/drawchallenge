import { getAnalyticsApiUrl, getClientId } from './storage.js';

export async function reportSubmission({ keyword, score }) {
  const base = getAnalyticsApiUrl();
  if (!base) return { ok: false, skipped: true };

  try {
    const response = await fetch(`${base}/api/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: getClientId(),
        keyword,
        score,
      }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return { ok: false, error: data.error || `Error ${response.status}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || 'Sin conexión con el registro' };
  }
}

export async function fetchStats(adminToken) {
  const base = getAnalyticsApiUrl();
  const response = await fetch(`${base}/api/stats`, {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Error ${response.status}`);
  }
  return data;
}
