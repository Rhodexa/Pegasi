export default class VSlider {
  constructor(container, { label = null, value = 50 } = {}) {
    this.container = container;

    // Render structure
    this.container.innerHTML = `
        <div class="labeled-vslider">
        <div class="vslider">
            ${label ? `<div class="label">${label}</div>` : ''}
                <div class="track">
                    <div class="thumb"></div>
                </div>
            </div>
        </div>
    `;

    this.vslider = this.container.querySelector('.vslider');
    this.track = this.container.querySelector('.track');
    this.thumb = this.track.querySelector('.thumb');

    this.dragging = false;
    this.value = 0;

    this.setValue(value);

    // Events
    this.vslider.addEventListener('mousedown', this._onMouseDown.bind(this));
    window.addEventListener('mousemove', this._onMouseMove.bind(this));
    window.addEventListener('mouseup', this._onMouseUp.bind(this));
  }

  // Calculate % from mouse position
  _getPercentFromEvent(e) {
    const rect = this.track.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const percent = 100 - (offsetY / rect.height) * 100;
    return Math.max(0, Math.min(100, percent));
  }

  _onMouseDown(e) {
    this.dragging = true;
    this.setValue(this._getPercentFromEvent(e));
  }

  _onMouseMove(e) {
    if (!this.dragging) return;
    this.setValue(this._getPercentFromEvent(e));
  }

  _onMouseUp() {
    this.dragging = false;
  }

  setValue(percent) {
    percent = Math.max(0, Math.min(100, percent));
    this.track.style.backgroundPosition = `0% ${percent}%`;
    this.thumb.style.bottom = percent + '%';
    this.value = percent;
    if (this._onChange) this._onChange(percent);
  }

  getValue() {
    return this.value;
  }

  onChange(callback) {
    this._onChange = callback;
  }
}
