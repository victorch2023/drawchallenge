import { getGeminiQuotaSummary } from './storage.js';

function formatCompact(summary) {
  const { used, rpmUsed, rpmLimit, google } = summary;

  if (google?.remainingRequests != null) {
    const limit = google.limitRequests ?? '?';
    return `Google: ${google.remainingRequests}/${limit} · ${used} aquí`;
  }

  return `${used} hoy · ${rpmUsed}/${rpmLimit} min`;
}

function formatDetailed(summary) {
  const {
    used,
    rpdLimit,
    remainingAppEst,
    rpmUsed,
    rpmLimit,
    modelLabel,
    lastError,
    google,
    hasProxy,
    proxyUrl,
  } = summary;

  const lines = [
    '── Uso en Draw Challenge (local) ──',
    `Llamadas hoy en esta app: ${used}`,
    `Ritmo local: ${rpmUsed} de ~${rpmLimit}/min (${modelLabel})`,
    `Estimado solo esta app: ~${remainingAppEst} de ${rpdLimit}/día`,
  ];

  if (google?.remainingRequests != null) {
    lines.push(
      '',
      '── Cuota Google (vía proxy, headers) ──',
      `Restantes hoy: ${google.remainingRequests} de ${google.limitRequests ?? '?'}`,
    );
    if (google.remainingTokens != null) {
      lines.push(`Tokens restantes (minuto): ${google.remainingTokens} de ${google.limitTokens ?? '?'}`);
    }
    if (google.resetRequests) {
      lines.push(`Reinicio: ${google.resetRequests}`);
    }
    lines.push('Actualizado en la última llamada con proxy activo.');
  } else if (hasProxy) {
    lines.push(
      '',
      '── Cuota Google ──',
      'El proxy no devolvió headers de cuota en la última llamada.',
      'Google a veces no los incluye; el contador local sigue activo.',
    );
  } else {
    lines.push(
      '',
      '── Cuota Google ──',
      'Sin proxy configurado: no se puede leer la cuota real desde el navegador.',
      'Configura la URL del proxy Vercel en el panel para ver cuota de Google.',
    );
  }

  lines.push(
    '',
    'Reinicio diario: medianoche hora del Pacífico.',
    'Cuota oficial: aistudio.google.com → tu proyecto → Rate limits',
  );

  if (proxyUrl) {
    lines.push(`Proxy activo: ${proxyUrl}`);
  }

  if (lastError) {
    lines.push('', `Último bloqueo: ${lastError.message}`);
  }

  return lines.join('\n');
}

function applyQuotaClasses(el, summary) {
  el.classList.remove('quota-low', 'quota-empty', 'quota-rpm-warn', 'quota-google');

  const { used, rpdLimit, rpmUsed, rpmLimit, lastError, google } = summary;

  if (google?.remainingRequests != null) {
    el.classList.add('quota-google');
    if (google.remainingRequests <= 0) {
      el.classList.add('quota-empty');
      return;
    }
    if (google.remainingRequests <= 10) {
      el.classList.add('quota-low');
      return;
    }
  }

  if (lastError?.type === 'rpd') {
    el.classList.add('quota-empty');
    return;
  }

  if (lastError?.type === 'rpm' || rpmUsed >= rpmLimit - 1) {
    el.classList.add('quota-rpm-warn');
    return;
  }

  if (remainingBelowTenPercent(used, rpdLimit)) {
    el.classList.add('quota-low');
  }
}

function remainingBelowTenPercent(used, limit) {
  return limit - used <= Math.max(10, Math.floor(limit * 0.1));
}

export function refreshQuotaDisplay(el) {
  if (!el) return;

  const summary = getGeminiQuotaSummary();
  const isDetailed = el.classList.contains('quota-detail');

  if (isDetailed) {
    el.textContent = formatDetailed(summary);
  } else {
    el.textContent = formatCompact(summary);
    el.title = formatDetailed(summary);
  }

  applyQuotaClasses(el, summary);
}
