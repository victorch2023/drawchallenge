import {
  getKeywords,
  setKeywords,
  getActiveKeyword,
  setActiveKeyword,
} from './storage.js';
import { clearModelCache, onModelStatus, preloadModel } from './localModel.js';

const keywordInput = document.getElementById('keyword-input');
const btnAdd = document.getElementById('btn-add');
const keywordList = document.getElementById('keyword-list');
const activeDisplay = document.getElementById('active-keyword');
const modelStatus = document.getElementById('model-status-detail');
const btnPreload = document.getElementById('btn-preload-model');
const btnClearModel = document.getElementById('btn-clear-model');
const statusEl = document.getElementById('admin-status');

function showStatus(message, type = 'info') {
  statusEl.textContent = message;
  statusEl.className = `status-message ${type}`;
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

btnPreload.addEventListener('click', () => {
  btnPreload.disabled = true;
  preloadModel()
    .then(() => showStatus('El jurado ya está en este dispositivo.', 'success'))
    .catch((err) => showStatus(err.message, 'error'))
    .finally(() => {
      btnPreload.disabled = false;
    });
});

btnClearModel.addEventListener('click', async () => {
  await clearModelCache();
  showStatus('Modelo borrado de este navegador.', 'success');
});

onModelStatus((state) => {
  modelStatus.textContent = state.message;
  modelStatus.className = `key-status ${state.phase === 'ready' ? 'configured' : 'missing'}`;
});

renderKeywords();
