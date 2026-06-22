import {
  getGeminiApiKey,
  getGeminiModel,
  clearGeminiApiKey,
  recordGeminiUsage,
  setLastQuotaError,
  clearLastQuotaError,
  getGeminiProxyUrl,
  setGoogleQuotaSnapshot,
} from './storage.js';

export const FALLBACK_MODELS = ['gemini-2.5-flash-lite', 'gemini-2.0-flash'];

export function hasGeminiApiKey() {
  const key = getGeminiApiKey();
  return key.startsWith('AIza') || key.startsWith('AQ.');
}

export function validateGeminiApiKey(raw) {
  const key = String(raw || '').trim();
  if (!key) {
    throw new Error('Falta la API key de Gemini.');
  }
  if (!key.startsWith('AIza') && !key.startsWith('AQ.')) {
    throw new Error(
      'La key no parece de Gemini (debe empezar con AIza o AQ.). Cópiala desde aistudio.google.com/apikey'
    );
  }
  return key;
}

export function classifyGeminiError(detail) {
  let parsed;
  try {
    parsed = JSON.parse(detail);
  } catch {
    parsed = null;
  }

  const msg = parsed?.error?.message || String(detail || '');
  const status = parsed?.error?.status || '';
  const lower = msg.toLowerCase();

  if (status === 'API_KEY_INVALID' || /api key not valid/i.test(msg)) {
    return {
      type: 'auth',
      userMessage:
        'API key de Gemini rechazada. Ve al panel de control y pega una clave nueva desde aistudio.google.com/apikey.',
      clearKey: true,
    };
  }

  const isQuota =
    status === 'RESOURCE_EXHAUSTED' ||
    /429|quota|rate limit|resource_exhausted|exceeded/i.test(lower);

  if (isQuota) {
    const isRpm =
      /per minute|requests per minute|\brpm\b|retry in \d|too many requests/i.test(lower);
    return {
      type: isRpm ? 'rpm' : 'rpd',
      userMessage: isRpm
        ? 'Límite por minuto alcanzado. Espera 30–60 segundos y vuelve a intentar.'
        : 'Cuota diaria del proyecto agotada. Se reinicia a medianoche (hora del Pacífico).',
    };
  }

  return {
    type: 'other',
    userMessage: msg || 'Error al consultar Gemini.',
  };
}

export function friendlyGeminiError(detail) {
  const classified = classifyGeminiError(detail);
  if (classified.clearKey) clearGeminiApiKey();
  if (classified.type === 'rpm' || classified.type === 'rpd') {
    setLastQuotaError(classified.type, classified.userMessage);
  }
  return classified.userMessage;
}

export function isQuotaError(err) {
  const msg = String(err?.message || err).toLowerCase();
  return (
    msg.includes('429') ||
    msg.includes('cuota') ||
    msg.includes('quota') ||
    msg.includes('límite por minuto') ||
    msg.includes('cuota diaria')
  );
}

function applyProxyQuota(quota) {
  if (quota) setGoogleQuotaSnapshot(quota);
}

function applySuccessSideEffects() {
  recordGeminiUsage();
  clearLastQuotaError();
}

async function callViaProxy(proxyUrl, { prompt, schema, imageBase64, temperature }) {
  const response = await fetch(proxyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      schema,
      image: imageBase64,
      temperature,
      preferredModel: getGeminiModel(),
      apiKey: getGeminiApiKey(),
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (data.quota) applyProxyQuota(data.quota);

  if (!response.ok) {
    if (data.type === 'rpm' || data.type === 'rpd') {
      setLastQuotaError(data.type, data.error);
    }
    throw new Error(data.error || `Error del proxy (${response.status})`);
  }

  applySuccessSideEffects();
  return data.result;
}

async function callDirect({ prompt, schema, imageBase64, temperature }) {
  const apiKey = getGeminiApiKey();
  const preferred = getGeminiModel();
  const models = [preferred, ...FALLBACK_MODELS.filter((m) => m !== preferred)];
  const errors = [];

  for (const model of models) {
    try {
      const parts = [{ text: prompt }];
      if (imageBase64) {
        parts.push({
          inline_data: { mime_type: 'image/png', data: imageBase64 },
        });
      }

      const url =
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            temperature,
            responseMimeType: 'application/json',
            responseSchema: schema,
          },
        }),
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(friendlyGeminiError(detail));
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Gemini no devolvió contenido.');

      applySuccessSideEffects();
      return JSON.parse(text);
    } catch (err) {
      if (isQuotaError(err)) {
        errors.push(`${model}: ${err.message}`);
        continue;
      }
      throw err;
    }
  }

  throw new Error(
    errors.length > 0
      ? errors[errors.length - 1]
      : 'Cuota de Gemini agotada o modelos no disponibles.'
  );
}

export async function callGeminiJson({ prompt, schema, imageBase64, temperature = 0.7 }) {
  if (!hasGeminiApiKey()) {
    throw new Error(
      'Configura tu API key de Gemini en el panel de control (admin.html) antes de continuar.'
    );
  }

  const proxyUrl = getGeminiProxyUrl();
  const payload = { prompt, schema, imageBase64, temperature };

  if (proxyUrl) {
    try {
      return await callViaProxy(proxyUrl, payload);
    } catch (err) {
      if (!isQuotaError(err) && !String(err.message).includes('API key')) {
        console.warn('Proxy Gemini falló, usando llamada directa:', err.message);
        return callDirect(payload);
      }
      throw err;
    }
  }

  return callDirect(payload);
}
