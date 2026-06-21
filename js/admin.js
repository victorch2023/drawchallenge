import {
  getKeywords,
  setKeywords,
  getActiveKeyword,
  setActiveKeyword,
  getGeminiApiKey,
  setGeminiApiKey,
  clearGeminiApiKey,
  getGeminiModel,
  setGeminiModel,
  maskGeminiApiKey,
} from './storage.js';
import { hasGeminiApiKey, validateGeminiApiKey } from './evaluate.js';
import { refreshQuotaDisplay } from './quotaUi.js';

const keywordInput = document.getElementById('keyword-input');
const btnAdd = document.getElementById('btn-add');
const keywordList = document.getElementById('keyword-list');
const activeDisplay = document.getElementById('active-keyword');
const geminiKeyInput = document.getElementById('gemini-api-key');
const geminiModelSelect = document.getElementById('gemini-model');
const btnSaveGemini = document.getElementById('btn-save-gemini');
const btnClearGemini = document.getElementById('btn-clear-gemini');
const geminiStatus = document.getElementById('gemini-key-status');
const adminQuotaEl = document.getElementById('admin-quota-display');
const statusEl = document.getElementById('admin-status');

function showStatus(message, type = 'info') {
  statusEl.textContent = message;
  statusEl.className = `status-message ${type}`;
}

function renderGeminiStatus() {
  if (hasGeminiApiKey()) {
    geminiStatus.textContent = `Configurada: ${maskGeminiApiKey(getGeminiApiKey())}`;
    geminiStatus.className = 'key-status configured';
    adminQuotaEl.hidden = false;
    refreshQuotaDisplay(adminQuotaEl);
  } else {
    geminiStatus.textContent = 'No configurada';
    geminiStatus.className = 'key-status missing';
    adminQuotaEl.hidden = true;
  }
}

function renderKeywords() {
  const keywords = getKeywords();
  const active = getActiveKeyword();
  activeDisplay.textContent = active;
  keywordList.innerHTML = '';

  keywords.forEach((word) => {
    const li = document.createElement('li');
    li.className = word === active ? 'active' : '';

    const label = document.createElement('span');
    label.textContent = word;

    const actions = document.createElement('div');
    actions.className = 'keyword-actions';

    const btnUse = document.createElement('button');
    btnUse.type = 'button';
    btnUse.className = 'btn btn-small';
    btnUse.textContent = 'Usar';
    btnUse.addEventListener('click', () => {
      setActiveKeyword(word);
      renderKeywords();
      showStatus(`Palabra activa: "${word}"`, 'success');
    });

    const btnDelete = document.createElement('button');
    btnDelete.type = 'button';
    btnDelete.className = 'btn btn-small btn-danger';
    btnDelete.textContent = 'Eliminar';
    btnDelete.addEventListener('click', () => {
      const updated = keywords.filter((k) => k !== word);
      if (updated.length === 0) {
        showStatus('Debe quedar al menos una palabra.', 'error');
        return;
      }
      setKeywords(updated);
      if (getActiveKeyword() === word) setActiveKeyword(updated[0]);
      renderKeywords();
      showStatus('Palabra eliminada.', 'success');
    });

    actions.append(btnUse, btnDelete);
    li.append(label, actions);
    keywordList.appendChild(li);
  });
}

btnAdd.addEventListener('click', () => {
  const word = keywordInput.value.trim();
  if (!word) {
    showStatus('Escribe una palabra clave.', 'error');
    return;
  }

  const keywords = getKeywords();
  if (keywords.includes(word)) {
    showStatus('Esa palabra ya existe.', 'error');
    return;
  }

  setKeywords([...keywords, word]);
  keywordInput.value = '';
  renderKeywords();
  showStatus(`"${word}" añadida.`, 'success');
});

keywordInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') btnAdd.click();
});

btnSaveGemini.addEventListener('click', () => {
  try {
    const key = validateGeminiApiKey(geminiKeyInput.value);
    setGeminiApiKey(key);
    if (geminiModelSelect.value) setGeminiModel(geminiModelSelect.value);
    geminiKeyInput.value = '';
    renderGeminiStatus();
    showStatus('API key de Gemini guardada en este navegador.', 'success');
  } catch (err) {
    showStatus(err.message, 'error');
  }
});

btnClearGemini.addEventListener('click', () => {
  clearGeminiApiKey();
  geminiKeyInput.value = '';
  renderGeminiStatus();
  showStatus('API key eliminada de este navegador.', 'success');
});

geminiModelSelect.value = getGeminiModel();
renderGeminiStatus();
renderKeywords();
