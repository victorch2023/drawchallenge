import {
  env,
  AutoProcessor,
  AutoModelForVision2Seq,
  RawImage,
} from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';

const MODEL_ID = 'HuggingFaceTB/SmolVLM-256M-Instruct';

env.allowLocalModels = false;
env.useBrowserCache = true;
env.backends.onnx.wasm.numThreads = 1;

let processor = null;
let model = null;
let loading = null;
let loadRequestId = null;

async function detectDevice() {
  try {
    const adapter = await navigator.gpu?.requestAdapter();
    if (!adapter) return { device: 'wasm', fp16: false };
    return {
      device: 'webgpu',
      fp16: adapter.features.has('shader-f16'),
    };
  } catch {
    return { device: 'wasm', fp16: false };
  }
}

function dtypeFor(device, fp16) {
  if (device === 'webgpu' && fp16) {
    return {
      embed_tokens: 'fp16',
      vision_encoder: 'q4',
      decoder_model_merged: 'q4',
    };
  }
  return {
    embed_tokens: 'q8',
    vision_encoder: 'q4',
    decoder_model_merged: 'q4',
  };
}

function loadModel(requestId) {
  if (requestId) loadRequestId = requestId;
  if (model && processor) {
    self.postMessage({ status: 'ready', device: 'cached', requestId: loadRequestId });
    return Promise.resolve([processor, model]);
  }
  if (loading) return loading;

  loading = (async () => {
    const { device, fp16 } = await detectDevice();
    const progress_callback = (data) => self.postMessage(data);
    processor = await AutoProcessor.from_pretrained(MODEL_ID, { progress_callback });
    model = await AutoModelForVision2Seq.from_pretrained(MODEL_ID, {
      device,
      dtype: dtypeFor(device, fp16),
      progress_callback,
    });
    self.postMessage({ status: 'ready', device, requestId: loadRequestId });
    return [processor, model];
  })().catch((err) => {
    loading = null;
    processor = null;
    model = null;
    throw err;
  });

  return loading;
}

async function imageFromDataUrl(dataUrl) {
  const blob = await (await fetch(dataUrl)).blob();
  return RawImage.fromBlob(blob);
}

function extractAnswer(text) {
  const cleaned = String(text || '').replace(/<\|.*?\|>/g, '').trim();
  const marker = cleaned.lastIndexOf('RESPUESTA:');
  if (marker >= 0) return cleaned.slice(marker + 'RESPUESTA:'.length).trim();
  return cleaned;
}

async function generate({ requestId, prompt, imageDataUrl, maxNewTokens }) {
  const [proc, mdl] = await loadModel();
  const hasImage = Boolean(imageDataUrl);
  const content = [];
  if (hasImage) content.push({ type: 'image' });
  content.push({ type: 'text', text: prompt });

  const messages = [{ role: 'user', content }];
  const text = proc.apply_chat_template(messages, { add_generation_prompt: true });
  const images = hasImage ? [await imageFromDataUrl(imageDataUrl)] : null;
  const inputs = images
    ? await proc(text, images, { do_image_splitting: false })
    : await proc(text);

  const sequences = await mdl.generate({
    ...inputs,
    max_new_tokens: maxNewTokens,
    do_sample: false,
    repetition_penalty: 1.15,
  });

  const inputLen = inputs.input_ids.dims.at(-1);
  const newTokens = sequences.slice(null, [inputLen, null]);
  const decoded = proc.batch_decode(newTokens, { skip_special_tokens: true });

  self.postMessage({
    status: 'complete',
    requestId,
    output: extractAnswer(decoded[0]),
  });
}

self.addEventListener('message', (event) => {
  const { type, requestId } = event.data || {};

  if (type === 'load') {
    loadModel(requestId).catch((err) => {
      self.postMessage({
        status: 'error',
        requestId,
        data: err?.message || String(err),
      });
    });
    return;
  }

  if (type === 'generate') {
    generate(event.data).catch((err) => {
      self.postMessage({
        status: 'error',
        requestId,
        data: err?.message || String(err),
      });
    });
    return;
  }

  if (type === 'dispose') {
    processor = null;
    model = null;
    loading = null;
    self.postMessage({ status: 'disposed' });
  }
});
