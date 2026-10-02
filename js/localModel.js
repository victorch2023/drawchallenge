const MODEL_LABEL = 'SmolVLM 256M';
const DOWNLOAD_HINT = '~200 MB, solo la primera vez';

let worker = null;
let readyPromise = null;
const waiters = new Map();
const listeners = new Set();
const fileProgress = new Map();
let nextId = 0;

const status = {
  phase: 'idle',
  percent: 0,
  message: `Jurado local · ${DOWNLOAD_HINT}`,
  device: '',
};

function emit() {
  for (const fn of listeners) fn({ ...status });
}

function setStatus(patch) {
  Object.assign(status, patch);
  emit();
}

export function onModelStatus(listener) {
  listeners.add(listener);
  listener({ ...status });
  return () => listeners.delete(listener);
}

export function getModelStatus() {
  return { ...status };
}

function noteProgress(msg) {
  if (msg.status === 'initiate' || msg.status === 'download') {
    setStatus({
      phase: 'downloading',
      message: `Descargando ${MODEL_LABEL}…`,
    });
    return;
  }

  if (msg.status === 'progress' && msg.file) {
    const total = Number(msg.total) || 0;
    const loaded = Number(msg.loaded) || 0;
    fileProgress.set(msg.file, { loaded, total });
    let sumLoaded = 0;
    let sumTotal = 0;
    for (const file of fileProgress.values()) {
      sumLoaded += file.loaded;
      sumTotal += file.total;
    }
    const percent = sumTotal > 0 ? Math.min(100, Math.round((sumLoaded / sumTotal) * 100)) : Math.round(msg.progress || 0);
    setStatus({
      phase: 'downloading',
      percent,
      message: `Descargando ${MODEL_LABEL}… ${percent}%`,
    });
    return;
  }

  if (msg.status === 'ready') {
    fileProgress.clear();
    const where = msg.device === 'webgpu' ? 'GPU de este dispositivo' : 'este dispositivo';
    setStatus({
      phase: 'ready',
      percent: 100,
      device: msg.device || '',
      message: `Jurado listo · ${where}`,
    });
  }
}

function ensureWorker() {
  if (worker) return worker;
  worker = new Worker(new URL('./localModel.worker.js', import.meta.url), { type: 'module' });
  worker.addEventListener('message', (event) => {
    const msg = event.data || {};
    noteProgress(msg);

    if (!msg.requestId || !waiters.has(msg.requestId)) {
      if (msg.status === 'error' && status.phase !== 'ready') {
        setStatus({
          phase: 'error',
          message: 'No se pudo preparar el jurado en este navegador.',
        });
      }
      return;
    }

    const pending = waiters.get(msg.requestId);
    if (msg.status === 'ready' || msg.status === 'complete') {
      waiters.delete(msg.requestId);
      pending.resolve(msg.output || '');
      return;
    }
    if (msg.status === 'error') {
      waiters.delete(msg.requestId);
      pending.reject(new Error(msg.data || 'El modelo no pudo responder.'));
    }
  });
  worker.addEventListener('error', (event) => {
    setStatus({
      phase: 'error',
      message: event.message || 'No se pudo cargar el jurado.',
    });
  });
  return worker;
}

export function preloadModel() {
  if (status.phase === 'ready') return Promise.resolve();
  if (!readyPromise) {
    const id = ++nextId;
    readyPromise = new Promise((resolve, reject) => {
      waiters.set(id, { resolve, reject });
      ensureWorker().postMessage({ type: 'load', requestId: id });
    }).then(() => {
      if (status.phase !== 'ready') {
        setStatus({ phase: 'ready', percent: 100, message: 'Jurado listo en este dispositivo' });
      }
    }).catch((err) => {
      readyPromise = null;
      throw err;
    });
  }
  return readyPromise;
}

export async function generateText({ prompt, imageDataUrl = null, maxNewTokens = 48 }) {
  await preloadModel();
  const requestId = ++nextId;
  const output = await new Promise((resolve, reject) => {
    waiters.set(requestId, { resolve, reject });
    ensureWorker().postMessage({
      type: 'generate',
      requestId,
      prompt,
      imageDataUrl,
      maxNewTokens,
    });
  });
  return String(output || '').trim();
}

export async function clearModelCache() {
  worker?.postMessage({ type: 'dispose' });
  worker?.terminate();
  worker = null;
  readyPromise = null;
  fileProgress.clear();
  const names = await caches.keys();
  await Promise.all(
    names
      .filter((name) => name.toLowerCase().includes('transformer'))
      .map((name) => caches.delete(name))
  );
  setStatus({
    phase: 'idle',
    percent: 0,
    device: '',
    message: `Modelo borrado. Se volverá a descargar (${DOWNLOAD_HINT}).`,
  });
}
