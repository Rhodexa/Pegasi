export default class HSlider {
  constructor(container, { label = null, value = 50, numbers = false, min = 0, max = 100, unit = "" } = {}) {
    this.has_numbers = numbers;
    this.min = min;
    this.max = max;
    this.slider = container;
    this.label_content = label;
    this.unit = unit;
    
    // Render structure
    this.slider.classList.add('hslider');
    this.slider.innerHTML = `
        ${label ? `<div class="label">${label}</div>` : '<div class="label"></div>'}
        <div class="track">
          <div class="thumb"></div>
        </div>
    `;

    this.track = this.slider.querySelector('.track');
    this.thumb = this.track.querySelector('.thumb');
    this.label = this.slider.querySelector('.label');

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
    const offsetX = e.clientX - rect.left;
    const percent = (offsetX / rect.width) * 100;
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
    this.track.style.backgroundPosition = `${100 - percent}% 0%`;
    this.thumb.style.left = percent + '%';
    this.value = percent;

    this.label.textContent = this.label_content ? this.label_content : "";
    this.label.textContent += this.has_numbers ? `: ${Math.round(percent*(0.01 * (this.max - this.min)) + this.min)}${this.unit}` : "";

    if (this._onChange) this._onChange(percent);
  }

  getValue() {
    return this.value;
  }

  onChange(callback) {
    this._onChange = callback;
  }
}
