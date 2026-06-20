import {
  getGeminiApiKey,
  getGeminiModel,
  clearGeminiApiKey,
} from './storage.js';

export const FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'];

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

export function friendlyGeminiError(detail) {
  let parsed;
  try {
    parsed = JSON.parse(detail);
  } catch {
    parsed = null;
  }

  const msg = parsed?.error?.message || String(detail || '');
  const reason = parsed?.error?.status || '';

  if (reason === 'API_KEY_INVALID' || /api key not valid/i.test(msg)) {
    clearGeminiApiKey();
    return (
      'API key de Gemini rechazada. Ve al panel de control, pega una clave nueva desde aistudio.google.com/apikey y guarda.'
    );
  }

  if (/429|quota|rate limit|resource_exhausted/i.test(msg)) {
    return 'Cuota de Gemini agotada. Espera unos minutos o revisa tu plan en Google AI Studio.';
  }

  return msg || 'Error al consultar Gemini.';
}

export function isQuotaError(err) {
  const msg = String(err?.message || err).toLowerCase();
  return msg.includes('429') || msg.includes('cuota') || msg.includes('quota');
}

export async function callGeminiJson({ prompt, schema, imageBase64, tools, temperature = 0.7 }) {
  const apiKey = getGeminiApiKey();
  if (!hasGeminiApiKey()) {
    throw new Error(
      'Configura tu API key de Gemini en el panel de control (admin.html) antes de continuar.'
    );
  }

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

      const body = {
        contents: [{ parts }],
        generationConfig: {
          temperature,
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      };

      if (tools?.length) {
        body.tools = tools;
      }

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

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(friendlyGeminiError(detail));
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Gemini no devolvió contenido.');

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
    `Cuota de Gemini agotada o modelos no disponibles.\n${errors.slice(-2).join('\n')}`
  );
}
