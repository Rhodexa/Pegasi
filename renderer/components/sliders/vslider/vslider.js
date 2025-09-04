export default class VSlider {
  constructor(container, { label = null, value = 50 } = {}) {
    this.slider = container;
    
    // Render structure
    this.slider.classList.add('vslider');
    this.slider.innerHTML = `
        ${label ? `<div class="label">${label}</div>` : ''}
        <div class="track">
          <div class="thumb"></div>
        </div>
    `;

    this.track = this.slider.querySelector('.track');
    this.thumb = this.track.querySelector('.thumb');

    this.dragging = false;
    this.value = 0;

    this.setValue(value);

    // Events
    this.slider.addEventListener('mousedown', this._onMouseDown.bind(this));
    window.addEventListener('mousemove', this._onMouseMove.bind(this));
    window.addEventListener('mouseup', this._onMouseUp.bind(this));
    this.slider.addEventListener('wheel', this._onWheel.bind(this)); // Mouse wheel event
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

  // Handle mouse wheel event
  _onWheel(e) {
    e.preventDefault(); // Prevent page scrolling

    let delta = e.deltaY > 0 ? -5 : 5; // Check the wheel direction
    this.setValue(this.value + delta); // Adjust the value by 1% per wheel event
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
