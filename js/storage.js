const STORAGE_KEYS = {
  keywords: 'drawchallenge_keywords',
  activeKeyword: 'drawchallenge_active_keyword',
  gameMode: 'drawchallenge_game_mode',
  wordHistory: 'drawchallenge_gemini_word_history',
};

const DEFAULT_KEYWORDS = ['árbol', 'casa', 'sol', 'gato', 'coche', 'flor'];
const MAX_WORD_HISTORY = 200;

export function getKeywords() {
  const stored = localStorage.getItem(STORAGE_KEYS.keywords);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.keywords, JSON.stringify(DEFAULT_KEYWORDS));
    return [...DEFAULT_KEYWORDS];
  }
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...DEFAULT_KEYWORDS];
  } catch {
    return [...DEFAULT_KEYWORDS];
  }
}

export function setKeywords(keywords) {
  const cleaned = keywords.map((k) => k.trim()).filter(Boolean);
  localStorage.setItem(STORAGE_KEYS.keywords, JSON.stringify(cleaned));
  return cleaned;
}

export function getActiveKeyword() {
  const stored = localStorage.getItem(STORAGE_KEYS.activeKeyword);
  if (stored) return stored;

  const keywords = getKeywords();
  const first = keywords[0] ?? 'árbol';
  setActiveKeyword(first);
  return first;
}

export function setActiveKeyword(keyword) {
  localStorage.setItem(STORAGE_KEYS.activeKeyword, keyword.trim());
}

export function pickRandomKeyword() {
  const keywords = getKeywords();
  if (keywords.length === 0) return null;
  const current = getActiveKeyword();
  const pool = keywords.length > 1 ? keywords.filter((k) => k !== current) : keywords;
  const next = pool[Math.floor(Math.random() * pool.length)];
  setActiveKeyword(next);
  return next;
}

export function getGameMode() {
  const mode = localStorage.getItem(STORAGE_KEYS.gameMode);
  return mode === 'manual' ? 'manual' : 'local';
}

export function setGameMode(mode) {
  localStorage.setItem(STORAGE_KEYS.gameMode, mode === 'manual' ? 'manual' : 'local');
}

export function getWordHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.wordHistory) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addWordToHistory(word) {
  const cleaned = word.trim();
  if (!cleaned) return;
  const history = getWordHistory().filter((w) => w.toLowerCase() !== cleaned.toLowerCase());
  history.unshift(cleaned);
  localStorage.setItem(STORAGE_KEYS.wordHistory, JSON.stringify(history.slice(0, MAX_WORD_HISTORY)));
}
