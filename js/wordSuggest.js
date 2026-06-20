import { callGeminiJson } from './geminiClient.js';
import {
  getGeminiWordHistory,
  addGeminiWordToHistory,
} from './storage.js';

const WORD_SCHEMA = {
  type: 'object',
  properties: {
    word: {
      type: 'string',
      description: 'Una sola palabra o frase muy corta (máx. 3 palabras) en español',
    },
    hint: {
      type: 'string',
      description: 'Breve nota opcional sobre por qué es dibujable',
    },
  },
  required: ['word'],
};

function buildSuggestPrompt(recentWords) {
  const avoid =
    recentWords.length > 0
      ? `\nNO repitas estas palabras recientes: ${recentWords.join(', ')}.`
      : '';

  return `Eres el generador de palabras de un juego de dibujo y adivinanzas como Pictionary, Cranium Doodle o similar.

Propón UNA palabra o frase muy corta (máximo 3 palabras) en español para que un jugador la dibuje con trazos simples en un lienzo digital.

Reglas estrictas:
- Debe describir un objeto, animal, lugar o cosa física concreta y reconocible (sustantivo).
- Debe poder dibujarse con líneas simples; evita conceptos abstractos (amor, libertad), verbos solos, emojis o marcas registradas.
- Inspírate en categorías típicas de juegos de mesa de dibujo: animales, objetos cotidianos, comida, vehículos, naturaleza, profesiones (con objeto icónico), deportes (con objeto).
- Prioriza palabras variadas, actuales y comunes en cultura popular; puedes usar búsqueda en Google si está disponible para ideas recientes y reconocibles.
- Responde solo en español.
${avoid}

Devuelve JSON con "word" y opcionalmente "hint" (una frase corta).`;
}

export async function suggestDrawingWord() {
  const recentWords = getGeminiWordHistory();
  const prompt = buildSuggestPrompt(recentWords);
  const base = {
    prompt,
    schema: WORD_SCHEMA,
    temperature: 0.9,
  };

  let parsed;
  try {
    parsed = await callGeminiJson({ ...base, tools: [{ google_search: {} }] });
  } catch {
    parsed = await callGeminiJson(base);
  }

  const word = String(parsed.word || '').trim();
  if (!word) {
    throw new Error('Gemini no propuso una palabra válida.');
  }

  addGeminiWordToHistory(word);
  return { word, hint: parsed.hint ? String(parsed.hint).trim() : '' };
}
