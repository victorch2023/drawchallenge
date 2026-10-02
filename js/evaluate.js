import { generateText } from './localModel.js';

const COMMENTS = {
  low: [
    (word) => `«${word}» no se reconoce. El lápiz y tú guardan un secreto.`,
    (word) => `«${word}» no se entiende. El jurado pide una pista escrita.`,
    (word) => `Falta «${word}». Sobran trazos que no cuentan nada.`,
  ],
  mid: [
    (word) => `«${word}» se intuye, pero hace falta entrecerrar los ojos.`,
    (word) => `Hay un «${word}» escondido. El resto parece calentamiento.`,
    (word) => `Casi se lee «${word}». El jurado no da puntos por intención.`,
  ],
  ok: [
    (word) => `«${word}» se entiende, aunque llegó con prisa y a medias.`,
    (word) => `«${word}» es reconocible, flojo de rasgos y de detalle.`,
    (word) => `Vale, se ve «${word}». Nadie aplaudiría todavía.`,
  ],
  good: [
    (word) => `«${word}» se ve bien. Reservado el aplauso, no el diploma.`,
    (word) => `«${word}» está claro: alguien lo adivinaría sin sufrir demasiado.`,
  ],
  high: [
    (word) => `«${word}» se adivina al instante. No te acostumbres.`,
    (word) => `Está claro «${word}». El jurado, a regañadientes, lo concede.`,
  ],
};

function bandFor(score) {
  if (score <= 3) return 'low';
  if (score <= 5) return 'mid';
  if (score <= 7) return 'ok';
  if (score <= 8) return 'good';
  return 'high';
}

export function commentForScore(score, keyword) {
  const word = String(keyword || 'dibujo').trim();
  const options = COMMENTS[bandFor(score)];
  const index = Math.floor(Math.random() * options.length);
  return options[index](word);
}

function buildPrompt(keyword) {
  return `The player had to draw: "${keyword}".
Look at the sketch and score only how recognizable it is.
1 means unrecognizable. 10 means anyone would guess it instantly. Be strict.
Reply with a single integer from 1 to 10 and nothing else.
RESPUESTA:`;
}

function parseScore(text) {
  const match = String(text || '').match(/\b(10|[1-9])\b/);
  const score = match ? Number(match[1]) : 4;
  return Math.min(10, Math.max(1, score));
}

export async function evaluateDrawing(keyword, imageBase64) {
  const text = await generateText({
    prompt: buildPrompt(keyword),
    imageDataUrl: `data:image/png;base64,${imageBase64}`,
    maxNewTokens: 8,
  });
  const score = parseScore(text);
  return {
    score,
    reason: commentForScore(score, keyword),
    keyword,
  };
}
