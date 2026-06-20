import { callGeminiJson } from './geminiClient.js';

export { hasGeminiApiKey, validateGeminiApiKey } from './geminiClient.js';

function buildPrompt(keyword) {
  return `Eres un jurado amable de un juego de dibujo rápido (estilo Pictionary).

El participante debía dibujar: "${keyword}".

Evalúa el boceto adjunto considerando:
- ¿Se reconoce la forma del objeto o concepto pedido?
- ¿Hay elementos clave (por ejemplo, un árbol debería tener tronco y copa)?
- Sé generoso con dibujos simples hechos a mano alzada; no exijas arte profesional.

Responde en español. La puntuación debe ser un entero del 1 al 10.`;
}

const EVAL_SCHEMA = {
  type: 'object',
  properties: {
    score: { type: 'integer', description: 'Puntuación del 1 al 10' },
    reason: { type: 'string', description: 'Breve explicación en español' },
  },
  required: ['score', 'reason'],
};

export async function evaluateDrawing(keyword, imageBase64) {
  const parsed = await callGeminiJson({
    prompt: buildPrompt(keyword),
    schema: EVAL_SCHEMA,
    imageBase64,
    temperature: 0.3,
  });

  return {
    score: Math.min(10, Math.max(1, Math.round(Number(parsed.score)))),
    reason: String(parsed.reason || 'Sin explicación.'),
    keyword,
  };
}
