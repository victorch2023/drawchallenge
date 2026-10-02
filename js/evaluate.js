import { generateText } from './localModel.js';

function buildPrompt(keyword) {
  return `Eres un jurado exigente de un juego de dibujar.
El jugador debía dibujar: "${keyword}".
Mira el boceto. Sé estricto: 1-3 si no se entiende, 4-6 si se intuye, 7-8 si es claro, 9-10 casi nunca.
Responde en español, exactamente así:
RESPUESTA:
un número del 1 al 10
una sola frase sarcástica de máximo 15 palabras`;
}

function trimReason(text, maxWords = 18) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'No se entiende el boceto.';
  if (words.length <= maxWords) return words.join(' ');
  return `${words.slice(0, maxWords).join(' ')}…`;
}

function parseVerdict(text) {
  const cleaned = String(text || '')
    .replace(/^RESPUESTA:\s*/i, '')
    .trim();
  const scoreMatch = cleaned.match(/\b(10|[1-9])\b/);
  const score = scoreMatch ? Number(scoreMatch[1]) : 4;
  const withoutScore = cleaned
    .replace(scoreMatch?.[0] ?? '', '')
    .replace(/^(puntuaci[oó]n|score|nota)\s*[:\-]?\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  return {
    score: Math.min(10, Math.max(1, score)),
    reason: trimReason(withoutScore || cleaned),
  };
}

export async function evaluateDrawing(keyword, imageBase64) {
  const text = await generateText({
    prompt: buildPrompt(keyword),
    imageDataUrl: `data:image/png;base64,${imageBase64}`,
    maxNewTokens: 48,
  });
  const verdict = parseVerdict(text);
  return { ...verdict, keyword };
}
