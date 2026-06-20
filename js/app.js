import { getActiveKeyword, pickRandomKeyword } from './storage.js';
import { DrawingCanvas } from './drawing.js';
import { evaluateDrawing, hasGeminiApiKey } from './evaluate.js';

const canvas = document.getElementById('drawing-canvas');
const keywordEl = document.getElementById('keyword-display');
const resultPanel = document.getElementById('result-panel');
const resultScore = document.getElementById('result-score');
const resultReason = document.getElementById('result-reason');
const statusEl = document.getElementById('status-message');

const btnClear = document.getElementById('btn-clear');
const btnSubmit = document.getElementById('btn-submit');
const btnRandom = document.getElementById('btn-random');

const drawing = new DrawingCanvas(canvas);

function showStatus(message, type = 'info') {
  statusEl.textContent = message;
  statusEl.className = `status-message ${type}`;
}

function refreshKeyword() {
  keywordEl.textContent = getActiveKeyword();
}

function hideResult() {
  resultPanel.hidden = true;
}

function showResult(score, reason) {
  resultScore.textContent = score;
  resultReason.textContent = reason;
  resultPanel.hidden = false;
}

btnClear.addEventListener('click', () => {
  drawing.clear();
  hideResult();
  showStatus('Lienzo limpio. ¡A dibujar!');
});

btnSubmit.addEventListener('click', async () => {
  hideResult();

  if (drawing.isEmpty()) {
    showStatus('Dibuja algo antes de entregar.', 'error');
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

btnRandom.addEventListener('click', () => {
  pickRandomKeyword();
  refreshKeyword();
  drawing.clear();
  hideResult();
  showStatus('Nueva palabra asignada. ¡Suerte!');
});

window.addEventListener('storage', (e) => {
  if (e.key?.startsWith('drawchallenge_')) refreshKeyword();
});

refreshKeyword();

if (!hasGeminiApiKey()) {
  showStatus('Configura tu API key de Gemini en el panel de control antes de entregar.', 'error');
}
