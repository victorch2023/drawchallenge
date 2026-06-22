const STORAGE_KEYS = {
  keywords: 'drawchallenge_keywords',
  activeKeyword: 'drawchallenge_active_keyword',
  geminiApiKey: 'drawchallenge_gemini_api_key',
  geminiModel: 'drawchallenge_gemini_model',
  gameMode: 'drawchallenge_game_mode',
  geminiWordHistory: 'drawchallenge_gemini_word_history',
  geminiDailyUsage: 'drawchallenge_gemini_daily_usage',
  geminiDailyLimit: 'drawchallenge_gemini_daily_limit',
  geminiRequestLog: 'drawchallenge_gemini_request_log',
  lastQuotaError: 'drawchallenge_last_quota_error',
  geminiProxyUrl: 'drawchallenge_proxy_url',
  googleQuotaSnapshot: 'drawchallenge_google_quota_snapshot',
};

const DEFAULT_KEYWORDS = ['árbol', 'casa', 'sol', 'gato', 'coche', 'flor'];
const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
const DEFAULT_PROXY_URL =
  'https://drawchallenge-victorch2023s-projects.vercel.app/api/gemini';
const MAX_WORD_HISTORY = 40;

/**
 * Límites orientativos del tier gratuito (RPD/RPM por modelo).
 * La cuota real la fija Google por proyecto; puede ser menor si compartes API key.
 * @see https://ai.google.dev/gemini-api/docs/rate-limits
 */
export const MODEL_LIMITS = {
  'gemini-2.5-flash': { rpd: 1500, rpm: 15, label: 'Flash' },
  'gemini-2.5-flash-lite': { rpd: 1500, rpm: 30, label: 'Flash-Lite' },
  'gemini-2.0-flash': { rpd: 200, rpm: 15, label: '2.0 Flash' },
  default: { rpd: 250, rpm: 15, label: 'desconocido' },
};

function getPacificDateKey() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
  }).format(new Date());
}

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

export function getGeminiApiKey() {
  return localStorage.getItem(STORAGE_KEYS.geminiApiKey)?.trim() || '';
}

export function setGeminiApiKey(key) {
  localStorage.setItem(STORAGE_KEYS.geminiApiKey, key.trim());
}

export function clearGeminiApiKey() {
  localStorage.removeItem(STORAGE_KEYS.geminiApiKey);
}

export function getGeminiModel() {
  return localStorage.getItem(STORAGE_KEYS.geminiModel) || DEFAULT_GEMINI_MODEL;
}

export function setGeminiModel(model) {
  localStorage.setItem(STORAGE_KEYS.geminiModel, model.trim());
}

export function maskGeminiApiKey(key) {
  if (!key || key.length < 8) return '—';
  return `${key.slice(0, 4)}…${key.slice(-4)}`;
}

export function getGameMode() {
  const mode = localStorage.getItem(STORAGE_KEYS.gameMode);
  return mode === 'manual' ? 'manual' : 'gemini';
}

export function setGameMode(mode) {
  localStorage.setItem(STORAGE_KEYS.gameMode, mode === 'manual' ? 'manual' : 'gemini');
}

export function getGeminiWordHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.geminiWordHistory) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addGeminiWordToHistory(word) {
  const cleaned = word.trim();
  if (!cleaned) return;
  const history = getGeminiWordHistory().filter(
    (w) => w.toLowerCase() !== cleaned.toLowerCase()
  );
  history.unshift(cleaned);
  localStorage.setItem(
    STORAGE_KEYS.geminiWordHistory,
    JSON.stringify(history.slice(0, MAX_WORD_HISTORY))
  );
}

export function getModelLimits(model = getGeminiModel()) {
  return MODEL_LIMITS[model] ?? MODEL_LIMITS.default;
}

export function getGeminiDailyLimit() {
  const custom = Number(localStorage.getItem(STORAGE_KEYS.geminiDailyLimit));
  if (custom > 0) return Math.round(custom);
  return getModelLimits().rpd;
}

export function setGeminiDailyLimit(limit) {
  const n = Math.round(Number(limit));
  if (n > 0) {
    localStorage.setItem(STORAGE_KEYS.geminiDailyLimit, String(n));
  } else {
    localStorage.removeItem(STORAGE_KEYS.geminiDailyLimit);
  }
}

function readDailyUsageRecord() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.geminiDailyUsage) || '{}');
  } catch {
    return {};
  }
}

function readRequestLog() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.geminiRequestLog) || '{}');
  } catch {
    return {};
  }
}

export function getGeminiUsageToday() {
  const today = getPacificDateKey();
  const record = readDailyUsageRecord();
  if (record.date !== today) return 0;
  return Number(record.count) || 0;
}

export function getRpmUsageLastMinute() {
  const now = Date.now();
  const today = getPacificDateKey();
  const log = readRequestLog();
  if (log.date !== today) return 0;
  return (log.timestamps || []).filter((t) => now - t < 60_000).length;
}

export function recordGeminiUsage() {
  const today = getPacificDateKey();
  const now = Date.now();
  const record = readDailyUsageRecord();
  const count = record.date === today ? (Number(record.count) || 0) + 1 : 1;

  const log = readRequestLog();
  const timestamps = (log.date === today ? log.timestamps || [] : [])
    .filter((t) => now - t < 120_000);
  timestamps.push(now);

  localStorage.setItem(
    STORAGE_KEYS.geminiDailyUsage,
    JSON.stringify({ date: today, count })
  );
  localStorage.setItem(
    STORAGE_KEYS.geminiRequestLog,
    JSON.stringify({ date: today, timestamps })
  );
  return count;
}

export function setLastQuotaError(type, message) {
  localStorage.setItem(
    STORAGE_KEYS.lastQuotaError,
    JSON.stringify({ type, message, at: Date.now() })
  );
}

export function getLastQuotaError() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.lastQuotaError) || 'null');
    if (!parsed?.at) return null;
    if (Date.now() - parsed.at > 24 * 60 * 60 * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearLastQuotaError() {
  localStorage.removeItem(STORAGE_KEYS.lastQuotaError);
}

export function getGeminiProxyUrl() {
  const stored = localStorage.getItem(STORAGE_KEYS.geminiProxyUrl)?.trim();
  if (stored) return stored;
  return DEFAULT_PROXY_URL;
}

export function setGeminiProxyUrl(url) {
  const cleaned = String(url || '').trim().replace(/\/$/, '');
  if (cleaned) {
    localStorage.setItem(STORAGE_KEYS.geminiProxyUrl, cleaned);
  } else {
    localStorage.removeItem(STORAGE_KEYS.geminiProxyUrl);
  }
}

export function setGoogleQuotaSnapshot(quota) {
  if (!quota) return;
  localStorage.setItem(
    STORAGE_KEYS.googleQuotaSnapshot,
    JSON.stringify({ ...quota, at: Date.now() })
  );
}

export function getGoogleQuotaSnapshot() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.googleQuotaSnapshot) || 'null');
    if (!parsed?.at) return null;
    if (Date.now() - parsed.at > 15 * 60 * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getGeminiQuotaSummary() {
  const model = getGeminiModel();
  const limits = getModelLimits(model);
  const used = getGeminiUsageToday();
  const rpdLimit = getGeminiDailyLimit();
  const rpmUsed = getRpmUsageLastMinute();
  const rpmLimit = limits.rpm;
  const remainingAppEst = Math.max(0, rpdLimit - used);
  const google = getGoogleQuotaSnapshot();
  const proxyUrl = getGeminiProxyUrl();

  return {
    used,
    rpdLimit,
    remainingAppEst,
    rpmUsed,
    rpmLimit,
    model,
    modelLabel: limits.label,
    lastError: getLastQuotaError(),
    google,
    proxyUrl,
    hasProxy: Boolean(proxyUrl),
  };
}
