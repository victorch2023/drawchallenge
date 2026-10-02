const STORAGE_KEYS = {
  keywords: 'drawchallenge_keywords',
  activeKeyword: 'drawchallenge_active_keyword',
  gameMode: 'drawchallenge_game_mode',
  wordHistory: 'drawchallenge_gemini_word_history',
  clientId: 'drawchallenge_client_id',
  analyticsApiUrl: 'drawchallenge_analytics_api_url',
};

const DEFAULT_KEYWORDS = ['árbol', 'casa', 'sol', 'gato', 'coche', 'flor'];
const DEFAULT_ANALYTICS_API =
  'https://drawchallenge-victorch2023s-projects.vercel.app';
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

function randomClientId() {
  if (globalThis.crypto?.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '');
  }
  return `id${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

export function getClientId() {
  let id = localStorage.getItem(STORAGE_KEYS.clientId)?.trim();
  if (id && /^[a-zA-Z0-9_-]{8,80}$/.test(id)) return id;
  id = randomClientId();
  localStorage.setItem(STORAGE_KEYS.clientId, id);
  return id;
}

export function getAnalyticsApiUrl() {
  const stored = localStorage.getItem(STORAGE_KEYS.analyticsApiUrl)?.trim();
  if (stored) return stored.replace(/\/$/, '');
  return DEFAULT_ANALYTICS_API;
}

export function setAnalyticsApiUrl(url) {
  const cleaned = String(url || '').trim().replace(/\/$/, '');
  if (cleaned) {
    localStorage.setItem(STORAGE_KEYS.analyticsApiUrl, cleaned);
  } else {
    localStorage.removeItem(STORAGE_KEYS.analyticsApiUrl);
  }
}
