import { callGeminiJson } from './geminiClient.js';

export { hasGeminiApiKey, validateGeminiApiKey } from './geminiClient.js';

function buildPrompt(keyword) {
  return `Eres un jurado EXIGENTE, sarcástico y gracioso de un juego de dibujo rápido (estilo Pictionary).

El participante debía dibujar: "${keyword}".

Evalúa el boceto adjunto con criterio estricto:
- ¿Se reconoce claramente lo pedido? Sin atajos vagos.
- ¿Tiene los rasgos mínimos? (ej. árbol = tronco Y copa, no un garabato).
- Penaliza líneas vacías, confusión con otro objeto o ausencia de detalle.

Escala de puntuación (sé duro):
- 1-3: no se entiende o es otra cosa.
- 4-5: se intuye a duras penas.
- 6-7: reconocible pero flojo o incompleto.
- 8: bastante claro; reservado para buenos bocetos.
- 9-10: casi nunca; solo si cualquiera lo adivinaría al instante.

Comentario ("reason"):
- Máximo 20 palabras. Una sola frase.
- Tono irónico, pícaro o divertido; puedes ser mordaz pero no insultante.
- Sin emojis. En español.

Responde en JSON con score (entero 1-10) y reason.`;
}

const EVAL_SCHEMA = {
  type: 'object',
  properties: {
    score: { type: 'integer', description: 'Puntuación estricta del 1 al 10' },
    reason: {
      type: 'string',
      description: 'Comentario sarcástico en español, máximo 20 palabras',
    },
  },
  required: ['score', 'reason'],
};

function trimReason(text, maxWords = 20) {
  const words = String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length <= maxWords) return words.join(' ');
  return `${words.slice(0, maxWords).join(' ')}…`;
}

export async function evaluateDrawing(keyword, imageBase64) {
  const parsed = await callGeminiJson({
    prompt: buildPrompt(keyword),
    schema: EVAL_SCHEMA,
    imageBase64,
    temperature: 0.5,
  });

  return {
    score: Math.min(10, Math.max(1, Math.round(Number(parsed.score)))),
    reason: trimReason(parsed.reason || 'Sin comentario.'),
    keyword,
  };
}
