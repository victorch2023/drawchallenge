const HAND_MODEL_URL =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const HAND_MODEL_ASSET =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

export class HandTracker {
  constructor(videoEl, onPointer) {
    this.videoEl = videoEl;
    this.onPointer = onPointer;
    this.landmarker = null;
    this.running = false;
    this.rafId = null;
  }

  async init() {
    const vision = await import(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm'
    );
    const { HandLandmarker, FilesetResolver } = vision;

    const fileset = await FilesetResolver.forVisionTasks(HAND_MODEL_URL);
    this.landmarker = await HandLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: HAND_MODEL_ASSET },
      runningMode: 'VIDEO',
      numHands: 1,
    });
  }

  async start() {
    if (!this.landmarker) await this.init();

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false,
    });

    this.videoEl.srcObject = stream;
    await this.videoEl.play();
    this.running = true;
    this._loop();
    return true;
  }

  stop() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);

    const stream = this.videoEl.srcObject;
    if (stream) stream.getTracks().forEach((t) => t.stop());
    this.videoEl.srcObject = null;
  }

  _loop() {
    if (!this.running) return;

    const now = performance.now();
    if (this.videoEl.readyState >= 2) {
      const result = this.landmarker.detectForVideo(this.videoEl, now);
      this._processHands(result);
    }

    this.rafId = requestAnimationFrame(() => this._loop());
  }

  _processHands(result) {
    if (!result.landmarks || result.landmarks.length === 0) {
      this.onPointer(null);
      return;
    }

    const landmarks = result.landmarks[0];
    const indexTip = landmarks[8];
    const thumbTip = landmarks[4];
    const middleTip = landmarks[12];

    const normalizedX = 1 - indexTip.x;
    const normalizedY = indexTip.y;

    const pinchDistance = Math.hypot(
      indexTip.x - thumbTip.x,
      indexTip.y - thumbTip.y
    );
    const indexExtended = indexTip.y < landmarks[6].y;
    const middleCurled = middleTip.y > landmarks[10].y;
    const shouldDraw = pinchDistance < 0.06 || (indexExtended && middleCurled);

    this.onPointer({ normalizedX, normalizedY, shouldDraw });
  }
}
