import { getGeminiQuotaSummary } from './storage.js';

export function refreshQuotaDisplay(el) {
  if (!el) return;

  const { used, limit, remaining } = getGeminiQuotaSummary();
  el.textContent = `Gemini hoy: ~${remaining} restantes (${used}/${limit})`;
  el.title =
    'Estimación según usos de esta app hoy. La cuota real de Google puede variar. Se reinicia a medianoche (hora del Pacífico).';

  el.classList.remove('quota-low', 'quota-empty');
  if (remaining <= 0) el.classList.add('quota-empty');
  else if (remaining <= Math.max(10, Math.floor(limit * 0.1))) el.classList.add('quota-low');
}
