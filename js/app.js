import {
  getActiveKeyword,
  pickRandomKeyword,
  setActiveKeyword,
  getGameMode,
  setGameMode,
} from './storage.js';
import { DrawingCanvas } from './drawing.js';
import { evaluateDrawing, hasGeminiApiKey } from './evaluate.js';
import { suggestDrawingWord } from './wordSuggest.js';

const canvas = document.getElementById('drawing-canvas');
const keywordEl = document.getElementById('keyword-display');
const wordHintEl = document.getElementById('word-hint');
const resultPanel = document.getElementById('result-panel');
const resultScore = document.getElementById('result-score');
const resultReason = document.getElementById('result-reason');
const statusEl = document.getElementById('status-message');

const btnClear = document.getElementById('btn-clear');
const btnSubmit = document.getElementById('btn-submit');
const btnNewWord = document.getElementById('btn-new-word');
const btnNextRound = document.getElementById('btn-next-round');
const btnModeGemini = document.getElementById('btn-mode-gemini');
const btnModeManual = document.getElementById('btn-mode-manual');

const drawing = new DrawingCanvas(canvas);
let gameMode = getGameMode();
let loadingWord = false;

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
  btnModeGemini.classList.toggle('active', gameMode === 'gemini');
  btnModeManual.classList.toggle('active', gameMode === 'manual');
  btnNewWord.textContent = gameMode === 'gemini' ? 'Otra de Gemini' : 'Otra de mi lista';
}

function hideResult() {
  resultPanel.hidden = true;
}

function showResult(score, reason) {
  resultScore.textContent = score;
  resultReason.textContent = reason;
  resultPanel.hidden = false;
}

function setLoadingWord(isLoading) {
  loadingWord = isLoading;
  btnNewWord.disabled = isLoading;
  btnModeGemini.disabled = isLoading;
  btnModeManual.disabled = isLoading;
}

async function assignNewWord() {
  hideResult();
  drawing.clear();

  if (gameMode === 'gemini') {
    if (!hasGeminiApiKey()) {
      showStatus('Configura tu API key en el panel de control.', 'error');
      return;
    }
    setLoadingWord(true);
    keywordEl.textContent = '…';
    setWordHint('');
    showStatus('Gemini está eligiendo una palabra dibujable…');
    try {
      const { word, hint } = await suggestDrawingWord();
      setActiveKeyword(word);
      refreshKeywordDisplay();
      setWordHint(hint);
      showStatus('¡Nueva palabra lista!', 'success');
    } catch (err) {
      refreshKeywordDisplay();
      showStatus(err.message, 'error');
    } finally {
      setLoadingWord(false);
    }
    return;
  }

  pickRandomKeyword();
  refreshKeywordDisplay();
  setWordHint('');
  showStatus('Nueva palabra de tu lista.', 'success');
}

function switchMode(mode) {
  if (mode === gameMode || loadingWord) return;
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

  if (!hasGeminiApiKey()) {
    showStatus('Configura tu API key en el panel de control.', 'error');
    return;
  }

  const keyword = getActiveKeyword();
  btnSubmit.disabled = true;
  showStatus('Gemini está evaluando tu dibujo…');

  try {
    const imageBase64 = drawing.toPNGBase64();
    const result = await evaluateDrawing(keyword, imageBase64);
    showResult(result.score, result.reason);
    showStatus('¡Evaluación lista!', 'success');
  } catch (err) {
    showStatus(err.message, 'error');
  } finally {
    btnSubmit.disabled = false;
  }
});

btnNewWord.addEventListener('click', () => assignNewWord());
btnNextRound.addEventListener('click', () => assignNewWord());
btnModeGemini.addEventListener('click', () => switchMode('gemini'));
btnModeManual.addEventListener('click', () => switchMode('manual'));

window.addEventListener('storage', (e) => {
  if (e.key?.startsWith('drawchallenge_')) {
    gameMode = getGameMode();
    updateModeUi();
    refreshKeywordDisplay();
  }
});

updateModeUi();
refreshKeywordDisplay();

if (!hasGeminiApiKey()) {
  showStatus('Configura tu API key de Gemini en el panel de control.', 'error');
} else if (gameMode === 'gemini') {
  assignNewWord();
} else {
  showStatus('');
}
