import {
  getAnalyticsApiUrl,
  setAnalyticsApiUrl,
} from './storage.js';
import { fetchStats } from './analytics.js';

const tokenInput = document.getElementById('admin-token');
const apiUrlInput = document.getElementById('analytics-api-url');
const btnLoad = document.getElementById('btn-load-stats');
const btnSaveApi = document.getElementById('btn-save-api');
const statusEl = document.getElementById('stats-status');
const summaryCard = document.getElementById('summary-card');
const tableCard = document.getElementById('table-card');
const summaryEl = document.getElementById('stats-summary');
const bodyEl = document.getElementById('stats-body');

const TOKEN_KEY = 'drawchallenge_admin_token';

function showStatus(message, type = 'info') {
  statusEl.textContent = message;
  statusEl.className = `status-message ${type}`;
}

function formatWhen(iso) {
  try {
    return new Intl.DateTimeFormat('es', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function render(data) {
  const { summary, rows } = data;
  summaryEl.innerHTML = `
    <p><strong>${summary.submissions}</strong> envíos</p>
    <p><strong>${summary.users}</strong> usuarios anónimos</p>
    <p>Nota media: <strong>${summary.averageScore}</strong></p>
  `;
  summaryCard.hidden = false;
  tableCard.hidden = false;

  bodyEl.innerHTML = '';
  if (!rows.length) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="4">Aún no hay envíos.</td>';
    bodyEl.appendChild(tr);
    return;
  }

  for (const row of rows) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.user}</td>
      <td>${row.keyword}</td>
      <td>${row.score}</td>
      <td>${formatWhen(row.at)}</td>
    `;
    bodyEl.appendChild(tr);
  }
}

btnSaveApi.addEventListener('click', () => {
  setAnalyticsApiUrl(apiUrlInput.value);
  apiUrlInput.value = getAnalyticsApiUrl();
  showStatus('URL de la API guardada en este navegador.', 'success');
});

btnLoad.addEventListener('click', async () => {
  const token = tokenInput.value.trim();
  if (!token) {
    showStatus('Escribe el ADMIN_TOKEN.', 'error');
    return;
  }

  sessionStorage.setItem(TOKEN_KEY, token);
  btnLoad.disabled = true;
  showStatus('Cargando estadísticas…');

  try {
    const data = await fetchStats(token);
    render(data);
    showStatus('Estadísticas actualizadas.', 'success');
  } catch (err) {
    summaryCard.hidden = true;
    tableCard.hidden = true;
    showStatus(err.message, 'error');
  } finally {
    btnLoad.disabled = false;
  }
});

apiUrlInput.value = getAnalyticsApiUrl();
tokenInput.value = sessionStorage.getItem(TOKEN_KEY) || '';
if (tokenInput.value) {
  btnLoad.click();
}
