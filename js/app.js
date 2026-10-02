import {
  getActiveKeyword,
  pickRandomKeyword,
  setActiveKeyword,
  getGameMode,
  setGameMode,
} from './storage.js';
import { DrawingCanvas } from './drawing.js';
import { evaluateDrawing } from './evaluate.js';
import { suggestDrawingWord } from './wordSuggest.js';
import { onModelStatus, preloadModel } from './localModel.js';
import { reportSubmission } from './analytics.js';

const canvas = document.getElementById('drawing-canvas');
const keywordEl = document.getElementById('keyword-display');
const wordHintEl = document.getElementById('word-hint');
const resultPanel = document.getElementById('result-panel');
const resultScore = document.getElementById('result-score');
const resultReason = document.getElementById('result-reason');
const statusEl = document.getElementById('status-message');
const modelStatusEl = document.getElementById('model-status');

const btnClear = document.getElementById('btn-clear');
const btnSubmit = document.getElementById('btn-submit');
const btnNewWord = document.getElementById('btn-new-word');
const btnNextRound = document.getElementById('btn-next-round');
const btnModeLocal = document.getElementById('btn-mode-local');
const btnModeManual = document.getElementById('btn-mode-manual');

const drawing = new DrawingCanvas(canvas);
let gameMode = getGameMode();
let loadingWord = false;
let busy = false;

function showStatus(message, type = 'info') {
  statusEl.textContent = message;
  statusEl.className = `status-message ${type}`;
}

function setWordHint(text) {
  if (text) {
    wordHintEl.textContent = text;
    wordHintEl.hidden = false;
  } else {
    wordHintEl.textContent = '';
    wordHintEl.hidden = true;
  }
}

function refreshKeywordDisplay() {
  keywordEl.textContent = getActiveKeyword();
}

function updateModeUi() {
  btnModeLocal.classList.toggle('active', gameMode === 'local');
  btnModeManual.classList.toggle('active', gameMode === 'manual');
  btnNewWord.textContent = gameMode === 'local' ? 'Otra al azar' : 'Otra de mi lista';
}

function hideResult() {
  resultPanel.hidden = true;
}

function showResult(score, reason) {
  resultScore.textContent = score;
  resultReason.textContent = reason;
  resultPanel.hidden = false;
}

function setBusy(isBusy) {
  busy = isBusy;
  loadingWord = isBusy;
  btnNewWord.disabled = isBusy;
  btnModeLocal.disabled = isBusy;
  btnModeManual.disabled = isBusy;
  btnSubmit.disabled = isBusy;
}

async function assignNewWord() {
  hideResult();
  drawing.clear();

  if (gameMode === 'local') {
    const { word, hint } = await suggestDrawingWord();
    setActiveKeyword(word);
    refreshKeywordDisplay();
    setWordHint(hint);
    showStatus('Palabra nueva.', 'success');
    return;
  }

  pickRandomKeyword();
  refreshKeywordDisplay();
  setWordHint('');
  showStatus('Nueva palabra de tu lista.', 'success');
}

function switchMode(mode) {
  if (mode === gameMode || busy) return;
  gameMode = mode;
  setGameMode(mode);
  updateModeUi();
  assignNewWord();
}

btnClear.addEventListener('click', () => {
  drawing.clear();
  hideResult();
  showStatus('Lienzo limpio.');
});

btnSubmit.addEventListener('click', async () => {
  hideResult();

  if (drawing.isEmpty()) {
    showStatus('Dibuja algo antes de entregar.', 'error');
    return;
  }

  const keyword = getActiveKeyword();
  setBusy(true);
  showStatus('El jurado está mirando tu dibujo…');

  try {
    const imageBase64 = drawing.toPNGBase64();
    const result = await evaluateDrawing(keyword, imageBase64);
    showResult(result.score, result.reason);
    showStatus('¡Evaluación lista!', 'success');
    reportSubmission({ keyword, score: result.score }).catch(() => {});
  } catch (err) {
    showStatus(err.message, 'error');
  } finally {
    setBusy(false);
  }
});

btnNewWord.addEventListener('click', () => assignNewWord());
btnNextRound.addEventListener('click', () => assignNewWord());
btnModeLocal.addEventListener('click', () => switchMode('local'));
btnModeManual.addEventListener('click', () => switchMode('manual'));

onModelStatus((state) => {
  const ready = state.phase === 'ready';
  const waiting = state.phase === 'idle' || state.phase === 'downloading';
  modelStatusEl.textContent = ready
    ? 'Juguemos'
    : 'Por favor, espera. Cargando juego...';
  modelStatusEl.classList.toggle('model-ready', ready);
  modelStatusEl.classList.toggle('model-downloading', waiting);
  modelStatusEl.classList.toggle('quota-empty', state.phase === 'error');
  if (state.phase === 'downloading' && !busy) {
    showStatus('Por favor, espera. Cargando juego...');
  }
});

updateModeUi();
refreshKeywordDisplay();
preloadModel().catch((err) => showStatus(err.message, 'error'));

if (gameMode === 'local') {
  assignNewWord();
} else {
  showStatus('El jurado se descarga una vez en este dispositivo.');
}
