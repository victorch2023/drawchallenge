import { getActiveKeyword, pickRandomKeyword } from './storage.js';
import { DrawingCanvas } from './drawing.js';
import { HandTracker } from './handTracking.js';
import { evaluateDrawing, hasGeminiApiKey } from './evaluate.js';

const canvas = document.getElementById('drawing-canvas');
const keywordEl = document.getElementById('keyword-display');
const resultPanel = document.getElementById('result-panel');
const resultScore = document.getElementById('result-score');
const resultReason = document.getElementById('result-reason');
const statusEl = document.getElementById('status-message');
const videoEl = document.getElementById('webcam');
const handPointer = document.getElementById('hand-pointer');

const btnClear = document.getElementById('btn-clear');
const btnSubmit = document.getElementById('btn-submit');
const btnRandom = document.getElementById('btn-random');
const btnModeMouse = document.getElementById('btn-mode-mouse');
const btnModeHand = document.getElementById('btn-mode-hand');

const drawing = new DrawingCanvas(canvas);
let handTracker = null;

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

function updateHandPointer(normalizedX, normalizedY, shouldDraw) {
  const rect = canvas.getBoundingClientRect();
  handPointer.style.left = `${normalizedX * rect.width}px`;
  handPointer.style.top = `${normalizedY * rect.height}px`;
  handPointer.classList.remove('hidden');
  handPointer.classList.toggle('drawing', shouldDraw);

  const clientX = rect.left + normalizedX * rect.width;
  const clientY = rect.top + normalizedY * rect.height;
  drawing.moveHandPointer(clientX, clientY, shouldDraw);
}

function setMode(mode) {
  btnModeMouse.classList.toggle('active', mode === 'mouse');
  btnModeHand.classList.toggle('active', mode === 'hand');
  drawing.setMode(mode);

  if (mode === 'hand') {
    startHandMode();
  } else {
    stopHandMode();
  }
}

async function startHandMode() {
  showStatus('Activando cámara y detección de mano…');
  try {
    if (!handTracker) {
      handTracker = new HandTracker(videoEl, (pointer) => {
        if (!pointer) {
          handPointer.classList.add('hidden');
          drawing.setHandDrawingEnabled(false);
          return;
        }
        drawing.setHandDrawingEnabled(true);
        updateHandPointer(pointer.normalizedX, pointer.normalizedY, pointer.shouldDraw);
      });
    }
    await handTracker.start();
    showStatus('Modo mano: pellizca pulgar e índice, o levanta solo el índice para dibujar.', 'success');
  } catch (err) {
    showStatus(`No se pudo usar la cámara: ${err.message}. Usa modo ratón.`, 'error');
    setMode('mouse');
  }
}

function stopHandMode() {
  if (handTracker) handTracker.stop();
  handPointer.classList.add('hidden');
  drawing.setHandDrawingEnabled(false);
  showStatus('');
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

btnModeMouse.addEventListener('click', () => setMode('mouse'));
btnModeHand.addEventListener('click', () => setMode('hand'));

window.addEventListener('storage', (e) => {
  if (e.key?.startsWith('drawchallenge_')) refreshKeyword();
});

refreshKeyword();
setMode('mouse');

if (!hasGeminiApiKey()) {
  showStatus('Configura tu API key de Gemini en el panel de control antes de entregar.', 'error');
}
