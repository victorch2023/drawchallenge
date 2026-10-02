import { generateText } from './localModel.js';
import { getWordHistory, addWordToHistory } from './storage.js';

function buildPrompt(recentWords) {
  const avoid = recentWords.length
    ? ` No uses: ${recentWords.slice(0, 12).join(', ')}.`
    : '';
  return `Ignora la imagen: es un recuadro vacío, no la describas.
Di una sola palabra en español, un objeto o animal fácil de dibujar (ejemplo: gato, casa, sol).${avoid}
Solo esa palabra.
RESPUESTA:`;
}

const WEAK_WORDS = /^(uno|dos|tres|cuatro|cinco|blanco|negro|imagen|foto|dibujo|palabra|respuesta|recuadro|cuadrado|nada|objeto|cosa|the|a|an)$/i;

function acceptableWord(word) {
  return Boolean(word) && word.length >= 3 && !WEAK_WORDS.test(word);
}

function parseWord(text) {
  const line = String(text || '')
    .replace(/^RESPUESTA:\s*/i, '')
    .split('\n')
    .map((part) => part.trim())
    .find(Boolean) || '';
  const word = line
    .replace(/^["'«»]+|["'«».!,]+$/g, '')
    .split(/[.:;]/)[0]
    .trim();
  const parts = word.split(/\s+/).filter(Boolean).slice(0, 3);
  if (parts.length === 0 || parts.join(' ').length > 32) return '';
  if (/^(palabra|respuesta|object|animal)$/i.test(parts[0])) return '';
  return parts.join(' ');
}

function placeholderImage() {
  const canvas = document.createElement('canvas');
  canvas.width = 48;
  canvas.height = 48;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 48, 48);
  return canvas.toDataURL('image/png');
}

export async function suggestDrawingWord() {
  const recentWords = getWordHistory();
  const imageDataUrl = placeholderImage();
  let word = '';

  for (let attempt = 0; attempt < 2 && !word; attempt += 1) {
    const extra = attempt === 0 ? '' : ' No respondas con números ni con la palabra imagen.';
    const text = await generateText({
      prompt: `${buildPrompt(recentWords)}${extra}`,
      imageDataUrl,
      maxNewTokens: 16,
    });
    const parsed = parseWord(text);
    if (acceptableWord(parsed)) word = parsed;
  }

  if (!word) {
    throw new Error('El jurado no propuso una palabra clara. Prueba otra vez.');
  }
  addWordToHistory(word);
  return { word, hint: '' };
}
