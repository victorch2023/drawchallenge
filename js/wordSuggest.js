import { addWordToHistory, getActiveKeyword, getWordHistory } from './storage.js';
import { DRAWABLE_WORDS } from './words.js';

export { DRAWABLE_WORDS };

function pickWord() {
  const recent = new Set(getWordHistory().map((word) => word.toLowerCase()));
  const current = getActiveKeyword().toLowerCase();
  let pool = DRAWABLE_WORDS.filter(
    (word) => word.toLowerCase() !== current && !recent.has(word.toLowerCase())
  );
  if (pool.length === 0) {
    pool = DRAWABLE_WORDS.filter((word) => word.toLowerCase() !== current);
  }
  if (pool.length === 0) pool = DRAWABLE_WORDS;
  return pool[Math.floor(Math.random() * pool.length)];
}

export async function suggestDrawingWord() {
  const word = pickWord();
  addWordToHistory(word);
  return { word, hint: '' };
}
