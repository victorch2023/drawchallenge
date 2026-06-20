export class DrawingCanvas {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
    this.strokeColor = '#1a1a2e';
    this.lineWidth = 4;
    this.mode = 'mouse';
    this.handDrawingEnabled = false;

    this._resize();
    window.addEventListener('resize', () => this._resize());

    this._bindMouseEvents();
    this._bindTouchEvents();
  }

  _resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = this.strokeColor;
    this.ctx.lineWidth = this.lineWidth;
  }

  _getPos(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  _startDraw(x, y) {
    this.isDrawing = true;
    this.lastX = x;
    this.lastY = y;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  }

  _drawTo(x, y) {
    if (!this.isDrawing) return;
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.lastX = x;
    this.lastY = y;
  }

  _stopDraw() {
    this.isDrawing = false;
  }

  _bindMouseEvents() {
    this.canvas.addEventListener('mousedown', (e) => {
      if (this.mode !== 'mouse') return;
      const { x, y } = this._getPos(e.clientX, e.clientY);
      this._startDraw(x, y);
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.mode !== 'mouse') return;
      const { x, y } = this._getPos(e.clientX, e.clientY);
      this._drawTo(x, y);
    });

    this.canvas.addEventListener('mouseup', () => this._stopDraw());
    this.canvas.addEventListener('mouseleave', () => this._stopDraw());
  }

  _bindTouchEvents() {
    this.canvas.addEventListener('touchstart', (e) => {
      if (this.mode !== 'mouse') return;
      e.preventDefault();
      const touch = e.touches[0];
      const { x, y } = this._getPos(touch.clientX, touch.clientY);
      this._startDraw(x, y);
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      if (this.mode !== 'mouse') return;
      e.preventDefault();
      const touch = e.touches[0];
      const { x, y } = this._getPos(touch.clientX, touch.clientY);
      this._drawTo(x, y);
    }, { passive: false });

    this.canvas.addEventListener('touchend', () => this._stopDraw());
  }

  setMode(mode) {
    this.mode = mode;
    this._stopDraw();
  }

  setHandDrawingEnabled(enabled) {
    this.handDrawingEnabled = enabled;
    if (!enabled) this._stopDraw();
  }

  moveHandPointer(clientX, clientY, shouldDraw) {
    if (!this.handDrawingEnabled || this.mode !== 'hand') return;
    const { x, y } = this._getPos(clientX, clientY);

    if (shouldDraw && !this.isDrawing) {
      this._startDraw(x, y);
    } else if (shouldDraw) {
      this._drawTo(x, y);
    } else {
      this._stopDraw();
    }
  }

  clear() {
    const rect = this.canvas.getBoundingClientRect();
    this.ctx.clearRect(0, 0, rect.width, rect.height);
    this._stopDraw();
  }

  isEmpty() {
    const { width, height } = this.canvas;
    const pixels = this.ctx.getImageData(0, 0, width, height).data;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] > 0) return false;
    }
    return true;
  }

  toPNGBase64() {
    const dataUrl = this.canvas.toDataURL('image/png');
    return dataUrl.split(',')[1];
  }
}
