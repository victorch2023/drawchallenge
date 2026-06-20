import {
  getGeminiApiKey,
  getGeminiModel,
  clearGeminiApiKey,
} from './storage.js';

const FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'];

function buildPrompt(keyword) {
  return `Eres un jurado amable de un juego de dibujo rápido (estilo Pictionary).

El participante debía dibujar: "${keyword}".

Evalúa el boceto adjunto considerando:
- ¿Se reconoce la forma del objeto o concepto pedido?
- ¿Hay elementos clave (por ejemplo, un árbol debería tener tronco y copa)?
- Sé generoso con dibujos simples hechos a mano alzada; no exijas arte profesional.

Responde en español. La puntuación debe ser un entero del 1 al 10.`;
}

function friendlyGeminiError(detail) {
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

function isQuotaError(err) {
  const msg = String(err?.message || err).toLowerCase();
  return msg.includes('429') || msg.includes('cuota') || msg.includes('quota');
}

async function callGemini(apiKey, model, keyword, imageBase64) {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: buildPrompt(keyword) },
            {
              inline_data: {
                mime_type: 'image/png',
                data: imageBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            score: { type: 'integer', description: 'Puntuación del 1 al 10' },
            reason: { type: 'string', description: 'Breve explicación en español' },
          },
          required: ['score', 'reason'],
        },
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

  const parsed = JSON.parse(text);
  return {
    score: Math.min(10, Math.max(1, Math.round(Number(parsed.score)))),
    reason: String(parsed.reason || 'Sin explicación.'),
    keyword,
  };
}

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

export async function evaluateDrawing(keyword, imageBase64) {
  const apiKey = getGeminiApiKey();
  if (!hasGeminiApiKey()) {
    throw new Error(
      'Configura tu API key de Gemini en el panel de control (admin.html) antes de entregar.'
    );
  }

  const preferred = getGeminiModel();
  const models = [preferred, ...FALLBACK_MODELS.filter((m) => m !== preferred)];
  const errors = [];

  for (const model of models) {
    try {
      return await callGemini(apiKey, model, keyword, imageBase64);
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
