const FALLBACK_MODELS = ['gemini-2.5-flash-lite', 'gemini-2.0-flash'];

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ||
  'https://victorch2023.github.io,http://localhost:8080,http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

function corsHeaders(origin) {
  const allowed =
    ALLOWED_ORIGINS.includes('*') ||
    (origin && ALLOWED_ORIGINS.some((o) => origin.startsWith(o)));

  return {
    'Access-Control-Allow-Origin': allowed ? origin || ALLOWED_ORIGINS[0] : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function extractQuotaFromHeaders(headers) {
  const map = {};
  headers.forEach((value, key) => {
    map[key.toLowerCase()] = value;
  });

  const pick = (...names) => {
    for (const name of names) {
      const value = map[name.toLowerCase()];
      if (value != null && value !== '') return value;
    }
    return null;
  };

  const remainingRequests = pick(
    'x-ratelimit-remaining-requests',
    'x-goog-ratelimit-remaining-requests',
    'x-ratelimit-remaining'
  );
  const limitRequests = pick(
    'x-ratelimit-limit-requests',
    'x-goog-ratelimit-limit-requests',
    'x-ratelimit-limit'
  );
  const remainingTokens = pick('x-ratelimit-remaining-tokens');
  const limitTokens = pick('x-ratelimit-limit-tokens');
  const resetRequests = pick('x-ratelimit-reset-requests', 'x-ratelimit-reset');

  if (remainingRequests == null && limitRequests == null) {
    return null;
  }

  return {
    remainingRequests: remainingRequests != null ? Number(remainingRequests) : null,
    limitRequests: limitRequests != null ? Number(limitRequests) : null,
    remainingTokens: remainingTokens != null ? Number(remainingTokens) : null,
    limitTokens: limitTokens != null ? Number(limitTokens) : null,
    resetRequests,
    source: 'google-headers',
  };
}

function classifyError(detail) {
  let parsed;
  try {
    parsed = JSON.parse(detail);
  } catch {
    parsed = null;
  }

  const msg = parsed?.error?.message || String(detail || '');
  const status = parsed?.error?.status || '';
  const lower = msg.toLowerCase();
  const isQuota =
    status === 'RESOURCE_EXHAUSTED' ||
    /429|quota|rate limit|resource_exhausted|exceeded/i.test(lower);

  if (!isQuota) return { type: 'other', message: msg || 'Error al consultar Gemini.' };

  const isRpm =
    /per minute|requests per minute|\brpm\b|retry in \d|too many requests/i.test(lower);

  return {
    type: isRpm ? 'rpm' : 'rpd',
    message: isRpm
      ? 'Límite por minuto alcanzado. Espera 30–60 segundos.'
      : 'Cuota diaria del proyecto agotada. Reinicio a medianoche (Pacífico).',
  };
}

async function callGemini(model, apiKey, body) {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify(body),
  });

  const quota = extractQuotaFromHeaders(response.headers);

  if (!response.ok) {
    const detail = await response.text();
    const classified = classifyError(detail);
    return { ok: false, status: response.status, classified, quota };
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    return { ok: false, status: 502, classified: { type: 'other', message: 'Gemini no devolvió contenido.' }, quota };
  }

  return { ok: true, result: JSON.parse(text), quota, model };
}

export default async function handler(req, res) {
  const origin = req.headers.origin || req.headers.referer || '';
  Object.entries(corsHeaders(origin)).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { model, prompt, schema, image, temperature, apiKey: clientKey, preferredModel } =
    req.body || {};

  const apiKey = process.env.GEMINI_API_KEY || clientKey;
  if (!apiKey) {
    return res.status(400).json({
      error: 'Falta API key. Configúrala en el panel o en GEMINI_API_KEY de Vercel.',
    });
  }

  if (!prompt || !schema) {
    return res.status(400).json({ error: 'Faltan prompt o schema.' });
  }

  const parts = [{ text: prompt }];
  if (image) {
    parts.push({ inline_data: { mime_type: 'image/png', data: image } });
  }

  const geminiBody = {
    contents: [{ parts }],
    generationConfig: {
      temperature: temperature ?? 0.7,
      responseMimeType: 'application/json',
      responseSchema: schema,
    },
  };

  const primary = preferredModel || model || 'gemini-2.5-flash';
  const models = [primary, ...FALLBACK_MODELS.filter((m) => m !== primary)];
  const errors = [];
  let lastQuota = null;

  for (const tryModel of models) {
    const outcome = await callGemini(tryModel, apiKey, geminiBody);
    if (outcome.quota) lastQuota = outcome.quota;

    if (outcome.ok) {
      return res.status(200).json({
        result: outcome.result,
        quota: outcome.quota,
        model: outcome.model,
      });
    }

    if (outcome.classified?.type === 'rpm' || outcome.classified?.type === 'rpd') {
      errors.push(outcome.classified.message);
      continue;
    }

    return res.status(outcome.status || 500).json({
      error: outcome.classified?.message || 'Error al consultar Gemini.',
      quota: outcome.quota,
      type: outcome.classified?.type,
    });
  }

  return res.status(429).json({
    error: errors[errors.length - 1] || 'Cuota de Gemini agotada.',
    quota: lastQuota,
    type: 'rpd',
  });
}
